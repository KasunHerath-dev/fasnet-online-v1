// src/routes/internal/lmsAssignmentsRoute.js
//
// Internal endpoint — called ONLY by the lms-sync-service.
// Protected by shared secret header: x-internal-secret
// Never exposed to public.

const express = require('express');
const router = express.Router();
const Student = require('../../models/Student');
const User    = require('../../models/User');
const LmsAssignment = require('../../models/LmsAssignment');
const { decrypt } = require('../../utils/encryption');
const { createNotification } = require('../../controllers/notificationController');
const logger = require('../../utils/logger');

const INTERNAL_SECRET = process.env.MAIN_BACKEND_SECRET || '';

function requireInternalSecret(req, res, next) {
  const secret = req.headers['x-internal-secret'];
  if (!INTERNAL_SECRET || secret === INTERNAL_SECRET) {
    return next();
  }
  logger.warn(`Internal secret mismatch from ${req.ip}`);
  return res.status(401).json({ error: 'Unauthorized' });
}

// ── POST /api/internal/lms-assignments ─────────────────────────────────────
// Receives parsed assignments from lms-sync-service.
// Deduplicates, saves to MongoDB, fires real-time notifications.
router.post('/lms-assignments', requireInternalSecret, async (req, res) => {
  const { studentId, syncedAt, assignments } = req.body;

  if (!studentId || !Array.isArray(assignments)) {
    return res.status(400).json({ error: 'studentId and assignments[] required' });
  }

  try {
    // Find student and their linked user account for notification recipient
    const student = await Student.findById(studentId).populate('userRef');
    if (!student) {
      return res.status(404).json({ error: `Student ${studentId} not found` });
    }

    let newCount = 0;
    const newAssignments = [];

    for (const a of assignments) {
      // Check for duplicate by moodleUid
      const existing = await LmsAssignment.findOne({ student: studentId, moodleUid: a.uid });
      if (existing) continue;

      try {
        const saved = await LmsAssignment.create({
          student: studentId,
          moodleUid: a.uid,
          title: a.title,
          moduleCode: a.moduleCode,
          type: a.type,
          dueDate: a.dueDate ? new Date(a.dueDate) : null,
          description: a.description || '',
          categories: a.categories || '',
          syncedAt: syncedAt ? new Date(syncedAt) : new Date(),
          notified: false,
        });
        newAssignments.push(saved);
        newCount++;
      } catch (dupErr) {
        // Ignore duplicate key errors (race condition)
        if (dupErr.code !== 11000) throw dupErr;
      }
    }

    // Update student lastSync timestamp
    if (student.lmsCredentials) {
      student.lmsCredentials.lastSync = new Date();
      await student.save();
    }

    // ── Fire notifications ──────────────────────────────────────────────────
    // 1. Notify the synced student themselves for each new assignment
    // 2. Notify all other students in the same combination about NEW deadlines

    if (newAssignments.length > 0) {
      // Resolve combination peers (same combination, OR fallback to level+semester)
      let peerUserIds = [];
      const combo = student.combination;
      const level = student.level;
      const sem   = student.currentSemester;

      const peerQuery = combo
        ? { combination: combo, _id: { $ne: student._id }, userRef: { $ne: null } }
        : { level, currentSemester: sem, _id: { $ne: student._id }, userRef: { $ne: null } };

      const peers = await Student.find(peerQuery).select('userRef').lean();
      peerUserIds = peers.map(p => p.userRef).filter(Boolean);

      for (const assignment of newAssignments) {
        const daysUntilDue = assignment.dueDate
          ? Math.ceil((new Date(assignment.dueDate) - Date.now()) / (1000 * 60 * 60 * 24))
          : null;

        const urgency =
          daysUntilDue === null ? '📅'
          : daysUntilDue <= 1  ? '🔴 Due Tomorrow!'
          : daysUntilDue <= 3  ? '🟡 Due Soon'
          : '📅';

        const notifTitle = `${urgency} ${assignment.moduleCode || 'LMS'} — ${assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}`;
        const notifBody = assignment.dueDate
          ? `"${assignment.title}" is due on ${new Date(assignment.dueDate).toLocaleDateString('en-GB', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}`
          : `"${assignment.title}"`;

        // ── Notify the synced student ──
        if (student.userRef) {
          await createNotification({
            recipient: student.userRef._id || student.userRef,
            type: 'lms_deadline',
            title: notifTitle,
            body: notifBody,
            link: '/schedule',
          }).catch(() => {});
        }

        // ── Notify all combination peers ──
        for (const peerId of peerUserIds) {
          await createNotification({
            recipient: peerId,
            type: 'lms_deadline',
            title: `📢 ${assignment.moduleCode || 'LMS'} Deadline Shared`,
            body: `A classmate synced: ${notifBody}`,
            link: '/schedule',
          }).catch(() => {});
        }

        assignment.notified = true;
        await assignment.save();
      }
    }

    // ── Admin alert: check combination coverage ─────────────────────────────
    // After every sync, inspect ALL students in this combination.
    // If any are missing a portal account OR haven't linked LMS, notify admins.
    try {
      const combo = student.combination;
      const level = student.level;
      const sem   = student.currentSemester;

      // All students in same combination (including the one who just synced)
      const allInCombo = await Student.find(
        combo
          ? { combination: combo }
          : { level, currentSemester: sem }
      ).select('_id fullName registrationNumber userRef lmsCredentials').lean();

      const noAccount = allInCombo.filter(s => !s.userRef);
      const noLms     = allInCombo.filter(s => s.userRef && !s.lmsCredentials?.username);
      const totalGaps = noAccount.length + noLms.length;

      if (totalGaps > 0) {
        // Find all admin / superadmin users to notify
        const admins = await User.find({
          roles: { $in: ['admin', 'superadmin'] },
          isActive: true,
        }).select('_id').lean();

        const comboLabel = combo || `Level ${level} Sem ${sem}`;

        // Build a short student list (max 5 names to keep notification readable)
        const missingNames = [
          ...noAccount.map(s => `${s.fullName} (${s.registrationNumber}) — no portal account`),
          ...noLms.map(s =>    `${s.fullName} (${s.registrationNumber}) — no LMS linked`),
        ].slice(0, 5);

        const overflowMsg = totalGaps > 5 ? ` …and ${totalGaps - 5} more.` : '';

        const adminTitle = `⚠️ LMS Gap — ${comboLabel}: ${totalGaps} student(s) not connected`;
        const adminBody  = `${missingNames.join(' | ')}${overflowMsg} — Please send them a portal invite.`;

        for (const admin of admins) {
          await createNotification({
            recipient: admin._id,
            type: 'lms_gap_alert',
            title: adminTitle,
            body: adminBody,
            link: `/admin/students?combination=${encodeURIComponent(comboLabel)}`,
          }).catch(() => {});
        }

        logger.warn(`[LMS Coverage] ${comboLabel}: ${noAccount.length} no-account, ${noLms.length} no-LMS. ${admins.length} admin(s) notified.`);
      }
    } catch (coverageErr) {
      // Non-fatal — don't block the sync response
      logger.error('[LMS Coverage] Gap check failed:', coverageErr.message);
    }

    logger.info(`[LMS Internal] Student ${studentId}: ${newCount} new assignment(s) saved, combination notified.`);
    return res.json({
      received: assignments.length,
      newSaved: newCount,
      duplicatesSkipped: assignments.length - newCount,
    });
  } catch (err) {
    logger.error('lms-assignments internal error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /api/internal/students/lms-credentials ─────────────────────────────
// Called by lms-sync-service cron job to get all students with credentials.
router.get('/students/lms-credentials', requireInternalSecret, async (req, res) => {
  try {
    const students = await Student.find(
      { 'lmsCredentials.username': { $exists: true }, 'lmsCredentials.syncEnabled': true },
      { _id: 1, 'lmsCredentials.username': 1, 'lmsCredentials.password': 1 }
    ).lean();

    const formatted = students.map((s) => ({
      studentId: s._id.toString(),
      username: s.lmsCredentials.username,
      // Decrypt AES-256 password for the sync service
      password: decrypt(s.lmsCredentials.password),
    }));

    res.json({ students: formatted, count: formatted.length });
  } catch (err) {
    logger.error('Error fetching LMS credentials:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/internal/lms-coverage-check ──────────────────────────────────
// Called by lms-sync-service after each cron cycle.
// Scans ALL active students grouped by combination (or level+semester).
// If ANY combination has ZERO LMS accounts linked → notifies all admins.
// Rate-limited per combination: only alerts once per 24 h to avoid spam.
router.post('/lms-coverage-check', requireInternalSecret, async (req, res) => {
  try {
    // All active students with enough data to group
    const allStudents = await Student.find({ status: 'Active' })
      .select('_id fullName registrationNumber combination level currentSemester userRef lmsCredentials')
      .lean();

    // Group by combination key
    const groups = {};
    for (const s of allStudents) {
      const key = s.combination || `Level${s.level}_Sem${s.currentSemester}`;
      if (!groups[key]) groups[key] = { label: s.combination || `Level ${s.level} Sem ${s.currentSemester}`, students: [] };
      groups[key].students.push(s);
    }

    // Find all admins once
    const admins = await User.find({ roles: { $in: ['admin', 'superadmin'] }, isActive: true })
      .select('_id')
      .lean();

    if (admins.length === 0) {
      return res.json({ checked: Object.keys(groups).length, alertsSent: 0, message: 'No admins to notify.' });
    }

    let alertsSent = 0;
    const uncoveredCombinations = [];

    for (const [key, group] of Object.entries(groups)) {
      const hasLms = group.students.some(s => s.lmsCredentials?.username);
      if (hasLms) continue; // ✅ At least one linked — no action needed

      // Zero LMS accounts in this combination
      uncoveredCombinations.push(group.label);

      // Rate-limit: skip if an identical alert was sent in the last 24 h
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const Notification = require('../models/Notification');
      const alreadyAlerted = await Notification.findOne({
        type: 'lms_no_coverage',
        body: { $regex: group.label, $options: 'i' },
        createdAt: { $gte: since },
      }).lean();
      if (alreadyAlerted) continue;

      // Build the alert
      const names = group.students
        .slice(0, 5)
        .map(s => `${s.fullName} (${s.registrationNumber})`)
        .join(', ');
      const overflow = group.students.length > 5 ? ` …+${group.students.length - 5} more` : '';

      const title = `🚨 No LMS Account — ${group.label} (${group.students.length} students)`;
      const body  = `Combination "${group.label}" has NO LMS accounts linked. Students: ${names}${overflow}. Please invite them to connect their Moodle account.`;
      const link  = `/admin/students?combination=${encodeURIComponent(group.label)}`;

      for (const admin of admins) {
        await createNotification({
          recipient: admin._id,
          type: 'lms_no_coverage',
          title,
          body,
          link,
        }).catch(() => {});
      }

      alertsSent++;
      logger.warn(`[LMS Coverage] "${group.label}" has 0 LMS accounts — ${admins.length} admin(s) alerted.`);
    }

    return res.json({
      checked: Object.keys(groups).length,
      uncovered: uncoveredCombinations,
      alertsSent,
    });
  } catch (err) {
    logger.error('[LMS Coverage Check] Error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
