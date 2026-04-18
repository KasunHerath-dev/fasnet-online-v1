// src/routes/internal/lmsAssignmentsRoute.js
//
// Internal endpoint — called ONLY by the lms-sync-service.
// Protected by shared secret header: x-internal-secret
// Never exposed to public.

const express = require('express');
const router = express.Router();
const Student = require('../../models/Student');
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

    // Fire Socket.IO notifications for each new assignment if user is linked
    if (student.userRef) {
      for (const assignment of newAssignments) {
        const daysUntilDue = assignment.dueDate
          ? Math.ceil((new Date(assignment.dueDate) - Date.now()) / (1000 * 60 * 60 * 24))
          : null;

        const urgency =
          daysUntilDue === null
            ? '📅'
            : daysUntilDue <= 1
            ? '🔴 Due Tomorrow!'
            : daysUntilDue <= 3
            ? '🟡 Due Soon'
            : '📅';

        const notifTitle = `${urgency} ${assignment.moduleCode || 'LMS'} — ${assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}`;
        const notifBody = assignment.dueDate
          ? `"${assignment.title}" is due on ${new Date(assignment.dueDate).toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}`
          : `"${assignment.title}"`;

        await createNotification({
          recipient: student.userRef._id,
          type: 'lms_deadline',
          title: notifTitle,
          body: notifBody,
          link: '/schedule',
        }).catch(() => {}); // Non-fatal

        assignment.notified = true;
        await assignment.save();
      }
    }

    logger.info(`[LMS Internal] Student ${studentId}: ${newCount} new assignment(s) saved.`);
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

module.exports = router;
