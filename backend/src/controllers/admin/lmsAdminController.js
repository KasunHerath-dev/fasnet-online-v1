// src/controllers/admin/lmsAdminController.js
// SuperAdmin-only controller for managing the LMS sync pipeline.

const axios = require('axios');
const Student = require('../../models/Student');
const User = require('../../models/User');
const LmsAssignment = require('../../models/LmsAssignment');
const { decrypt } = require('../../utils/encryption');
const { createNotification } = require('../notificationController');
const logger = require('../../utils/logger');

const LMS_SYNC_URL = process.env.LMS_SYNC_SERVICE_URL || 'http://localhost:4000';
const BACKEND_SECRET = process.env.MAIN_BACKEND_SECRET || '';

// ── GET /api/v1/admin/lms/stats ───────────────────────────────────────────────
// Overview numbers for the admin dashboard card.
exports.getStats = async (req, res) => {
  try {
    const totalLinked = await Student.countDocuments({ 'lmsCredentials.username': { $exists: true, $ne: '' } });
    const totalEnabled = await Student.countDocuments({ 'lmsCredentials.syncEnabled': true });
    const totalAssignments = await LmsAssignment.countDocuments();
    const upcomingAssignments = await LmsAssignment.countDocuments({
      dueDate: { $gte: new Date() },
      isCompleted: false,
    });
    const overdueAssignments = await LmsAssignment.countDocuments({
      dueDate: { $lt: new Date() },
      isCompleted: false,
    });

    const totalUnlinked = await Student.countDocuments({
      $or: [
        { 'lmsCredentials.username': { $exists: false } },
        { 'lmsCredentials.username': '' },
        { lmsCredentials: { $exists: false } },
      ],
      status: 'Active'
    });

    // Get students sorted by most recent sync
    const recentSyncs = await Student.find(
      { 'lmsCredentials.lastSync': { $exists: true, $ne: null } },
      { 'lmsCredentials.username': 1, 'lmsCredentials.lastSync': 1 }
    ).sort({ 'lmsCredentials.lastSync': -1 }).limit(5).lean();

    // Check if lms-sync-service is reachable
    let serviceOnline = false;
    try {
      const health = await axios.get(`${LMS_SYNC_URL}/health`, { timeout: 3000 });
      serviceOnline = health.status === 200;
    } catch { serviceOnline = false; }

    // ── Coverage check for Dashboard alert ──
    const allStudents = await Student.find({ status: 'Active' })
      .select('combination level currentSemester lmsCredentials')
      .lean();

    const groups = {};
    for (const s of allStudents) {
      const key = s.combination || `L${s.level}S${s.currentSemester}`;
      if (!groups[key]) {
        groups[key] = { 
          label: s.combination || `Level ${s.level} Sem ${s.currentSemester}`, 
          hasLms: false,
          count: 0
        };
      }
      groups[key].count++;
      if (s.lmsCredentials?.username) groups[key].hasLms = true;
    }

    const uncoveredGroups = Object.values(groups)
      .filter(g => !g.hasLms)
      .map(g => ({ label: g.label, studentCount: g.count }));

    res.json({
      success: true,
      data: {
        totalLinked,
        totalEnabled,
        totalAssignments,
        upcomingAssignments,
        overdueAssignments,
        serviceOnline,
        recentSyncs,
        uncoveredGroups,
        totalUnlinked, // 🚨 Added this
      }
    });
  } catch (err) {
    logger.error('lmsAdmin.getStats error:', err.message);
    res.status(500).json({ error: { message: 'Failed to fetch stats' } });
  }
};

// ── GET /api/v1/admin/lms/students ────────────────────────────────────────────
// All students with LMS status.
exports.getStudents = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {
      $or: [
        { 'lmsCredentials.username': { $exists: true } },
        { 'lmsCredentials.syncEnabled': true },
      ]
    };

    if (search) {
      query['lmsCredentials.username'] = { $regex: search, $options: 'i' };
    }

    const students = await Student.find(query)
      .select('name registrationNumber lmsCredentials')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Student.countDocuments(query);

    // Add assignment counts per student
    const withCounts = await Promise.all(students.map(async (s) => {
      const assignmentCount = await LmsAssignment.countDocuments({ student: s._id });
      const upcomingCount = await LmsAssignment.countDocuments({
        student: s._id,
        dueDate: { $gte: new Date() },
        isCompleted: false,
      });
      return {
        _id: s._id,
        name: s.name,
        registrationNumber: s.registrationNumber,
        lmsUsername: s.lmsCredentials?.username || null,
        syncEnabled: s.lmsCredentials?.syncEnabled || false,
        lastSync: s.lmsCredentials?.lastSync || null,
        assignmentCount,
        upcomingCount,
      };
    }));

    res.json({ success: true, data: withCounts, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    logger.error('lmsAdmin.getStudents error:', err.message);
    res.status(500).json({ error: { message: 'Failed to fetch students' } });
  }
};

// ── POST /api/v1/admin/lms/sync/all ──────────────────────────────────────────
// Trigger sync for ALL enabled students via lms-sync-service.
exports.syncAll = async (req, res) => {
  try {
    const response = await axios.post(
      `${LMS_SYNC_URL}/sync/all`,
      {},
      { headers: { 'x-internal-secret': BACKEND_SECRET }, timeout: 10000 }
    );
    logger.info('[LMS Admin] Triggered sync/all');
    res.json({ success: true, message: 'Sync triggered for all enabled students.', data: response.data });
  } catch (err) {
    const msg = err.response?.data?.error || err.message || 'Sync service unreachable';
    logger.error('lmsAdmin.syncAll error:', msg);
    res.status(503).json({ error: { message: msg, code: 'SYNC_SERVICE_UNREACHABLE' } });
  }
};

// ── POST /api/v1/admin/lms/sync/system-audit ──────────────────────────────────
// Trigger full sync + coverage check (cron logic) manually.
exports.runSystemAudit = async (req, res) => {
  try {
    const response = await axios.post(
      `${LMS_SYNC_URL}/sync/system-audit`,
      {},
      { headers: { 'x-internal-secret': BACKEND_SECRET }, timeout: 10000 }
    );
    logger.info('[LMS Admin] Manual System Audit triggered');
    res.json({ success: true, message: 'Full system audit and sync started.', data: response.data });
  } catch (err) {
    const msg = err.response?.data?.error || err.message || 'Sync service unreachable';
    logger.error('lmsAdmin.runSystemAudit error:', msg);
    res.status(503).json({ error: { message: msg, code: 'SYNC_SERVICE_UNREACHABLE' } });
  }
};

// ── POST /api/v1/admin/lms/sync/:studentId ───────────────────────────────────
// Trigger sync for a specific student.
exports.syncStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student || !student.lmsCredentials?.username) {
      return res.status(404).json({ error: { message: 'Student or LMS credentials not found' } });
    }

    const plainPassword = decrypt(student.lmsCredentials.password);

    const response = await axios.post(
      `${LMS_SYNC_URL}/sync/student`,
      {
        studentId: student._id.toString(),
        username: student.lmsCredentials.username,
        password: plainPassword,
      },
      { headers: { 'x-internal-secret': BACKEND_SECRET }, timeout: 10000 }
    );

    res.json({ success: true, message: `Sync triggered for ${student.lmsCredentials.username}`, data: response.data });
  } catch (err) {
    const msg = err.response?.data?.error || err.message;
    res.status(503).json({ error: { message: msg, code: 'SYNC_FAILED' } });
  }
};

// ── GET /api/v1/admin/lms/assignments ────────────────────────────────────────
// All assignments across all students (paginated, filterable).
exports.getAssignments = async (req, res) => {
  try {
    const { search = '', type = 'all', status = 'upcoming', page = 1, limit = 30 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (type !== 'all') query.type = type;
    if (status === 'upcoming') query.dueDate = { $gte: new Date() };
    if (status === 'overdue') query.dueDate = { $lt: new Date() };
    if (status === 'completed') query.isCompleted = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { moduleCode: { $regex: search, $options: 'i' } },
      ];
    }

    const [assignments, total] = await Promise.all([
      LmsAssignment.find(query)
        .populate('student', 'name registrationNumber')
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      LmsAssignment.countDocuments(query),
    ]);

    res.json({ success: true, data: assignments, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    logger.error('lmsAdmin.getAssignments error:', err.message);
    res.status(500).json({ error: { message: 'Failed to fetch assignments' } });
  }
};

// ── DELETE /api/v1/admin/lms/students/:studentId/credentials ─────────────────
// Admin removes a student's LMS credentials.
exports.removeStudentCredentials = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ error: { message: 'Student not found' } });

    student.lmsCredentials = undefined;
    await student.save();
    await LmsAssignment.deleteMany({ student: student._id });

    logger.info(`[LMS Admin] Removed credentials for student ${student._id}`);
    res.json({ success: true, message: `LMS credentials removed for ${student.name || student.registrationNumber}` });
  } catch (err) {
    logger.error('lmsAdmin.removeCredentials error:', err.message);
    res.status(500).json({ error: { message: 'Failed to remove credentials' } });
  }
};

// ── GET /api/v1/admin/lms/service/health ─────────────────────────────────────
// Check if lms-sync-service is alive.
exports.getServiceHealth = async (req, res) => {
  try {
    const response = await axios.get(`${LMS_SYNC_URL}/health`, { timeout: 4000 });
    res.json({ success: true, online: true, data: response.data });
  } catch (err) {
    res.json({ success: true, online: false, error: err.message });
  }
};

// ── GET /api/v1/admin/lms/students/unlinked ──────────────────────────────────
// Returns students who have NOT linked an LMS account yet.
exports.getUnlinkedStudents = async (req, res) => {
  try {
    const { search = '', limit = 50 } = req.query;

    // Students WITHOUT lmsCredentials.username
    const query = {
      $or: [
        { 'lmsCredentials.username': { $exists: false } },
        { 'lmsCredentials.username': '' },
        { lmsCredentials: { $exists: false } },
      ]
    };
    if (search) {
      query.registrationNumber = { $regex: search, $options: 'i' };
    }

    const students = await Student.find(query)
      .select('name registrationNumber')
      .limit(parseInt(limit))
      .lean();

    const total = await Student.countDocuments(query);
    res.json({ success: true, data: students, total });
  } catch (err) {
    logger.error('lmsAdmin.getUnlinkedStudents error:', err.message);
    res.status(500).json({ error: { message: 'Failed to fetch unlinked students' } });
  }
};

// ── POST /api/v1/admin/lms/invite ────────────────────────────────────────────
// Send LMS link invitation notification to one or more students.
// Body: { studentIds: ['...'], message?: '...' }
exports.sendInvite = async (req, res) => {
  try {
    const { studentIds, message } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: { message: 'studentIds array is required.' } });
    }

    const customMsg = message?.trim() ||
      'Your administrator has invited you to connect your Moodle LMS account. Link it from your Profile to get automatic deadline reminders.';

    let sent = 0;
    let failed = 0;

    for (const studentId of studentIds) {
      try {
        // Find the User account linked to this Student record
        const user = await User.findOne({ studentRef: studentId });
        if (!user) { failed++; continue; }

        await createNotification({
          recipient: user._id,
          type: 'lms_invite',
          title: '📅 Connect Your Moodle Account',
          body: customMsg,
          link: '/profile?section=lms',
        });
        sent++;
      } catch (err) {
        logger.error(`sendInvite failed for studentId ${studentId}: ${err.message}`);
        failed++;
      }
    }

    logger.info(`[LMS Admin] Sent ${sent} LMS invite notifications (${failed} failed)`);
    res.json({
      success: true,
      message: `Invitation sent to ${sent} student(s).${failed > 0 ? ` ${failed} failed.` : ''}`,
      sent,
      failed,
    });
  } catch (err) {
    logger.error('lmsAdmin.sendInvite error:', err.message);
    res.status(500).json({ error: { message: 'Failed to send invitations.' } });
  }
};
