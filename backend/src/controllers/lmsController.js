// src/controllers/lmsController.js
//
// Handles student-facing LMS operations:
//   • Save / remove encrypted LMS credentials on their Student record
//   • Manual sync trigger (calls lms-sync-service)
//   • Fetch saved assignments / deadlines

const axios = require('axios');
const Student = require('../models/Student');
const LmsAssignment = require('../models/LmsAssignment');
const { encrypt, decrypt } = require('../utils/encryption');
const logger = require('../utils/logger');

const LMS_SYNC_SERVICE_URL = process.env.LMS_SYNC_SERVICE_URL || 'http://localhost:4000';
const MAIN_BACKEND_SECRET = process.env.MAIN_BACKEND_SECRET || '';

// ── POST /api/v1/lms/credentials ──────────────────────────────────────────────
// Save or update the student's LMS credentials (encrypted at rest).
// Body: { lmsUsername, lmsPassword, consent: true }
exports.saveCredentials = async (req, res) => {
  try {
    const { lmsUsername, lmsPassword, consent } = req.body;

    if (!consent) {
      return res.status(400).json({ error: { message: 'Consent is required to store LMS credentials', code: 'CONSENT_REQUIRED' } });
    }
    if (!lmsUsername || !lmsPassword) {
      return res.status(400).json({ error: { message: 'LMS username and password are required', code: 'MISSING_FIELDS' } });
    }

    const user = req.user;
    if (!user.studentRef) {
      return res.status(400).json({ error: { message: 'No student profile linked to this account', code: 'NO_STUDENT' } });
    }

    const student = await Student.findById(user.studentRef._id || user.studentRef);
    if (!student) {
      return res.status(404).json({ error: { message: 'Student not found', code: 'STUDENT_NOT_FOUND' } });
    }

    // Encrypt password before saving
    const encryptedPassword = encrypt(lmsPassword);

    student.lmsCredentials = {
      username: lmsUsername.trim().toLowerCase(),
      password: encryptedPassword,
      syncEnabled: true,
      lastSync: student.lmsCredentials?.lastSync || null,
    };
    await student.save();

    logger.info(`LMS credentials saved for student ${student._id}`);
    res.json({
      success: true,
      message: 'LMS credentials saved securely.',
      lmsLinked: true,
      username: lmsUsername.trim().toLowerCase(),
    });
  } catch (err) {
    logger.error('saveCredentials error', { error: err.message });
    res.status(500).json({ error: { message: 'Failed to save credentials', code: 'SAVE_FAILED' } });
  }
};

// ── DELETE /api/v1/lms/credentials ───────────────────────────────────────────
// Remove stored LMS credentials and wipe synced assignments.
exports.removeCredentials = async (req, res) => {
  try {
    const user = req.user;
    if (!user.studentRef) {
      return res.status(400).json({ error: { message: 'No student profile linked', code: 'NO_STUDENT' } });
    }

    const student = await Student.findById(user.studentRef._id || user.studentRef);
    if (!student) {
      return res.status(404).json({ error: { message: 'Student not found', code: 'STUDENT_NOT_FOUND' } });
    }

    student.lmsCredentials = undefined;
    await student.save();

    // Also wipe saved assignments
    await LmsAssignment.deleteMany({ student: student._id });

    logger.info(`LMS credentials removed for student ${student._id}`);
    res.json({ success: true, message: 'LMS credentials removed.' });
  } catch (err) {
    logger.error('removeCredentials error', { error: err.message });
    res.status(500).json({ error: { message: 'Failed to remove credentials', code: 'REMOVE_FAILED' } });
  }
};

// ── POST /api/v1/lms/sync/trigger ────────────────────────────────────────────
// Manually kick off a sync for the logged-in student.
exports.triggerSync = async (req, res) => {
  try {
    const user = req.user;
    if (!user.studentRef) {
      return res.status(400).json({ error: { message: 'No student profile linked', code: 'NO_STUDENT' } });
    }

    const student = await Student.findById(user.studentRef._id || user.studentRef);
    if (!student || !student.lmsCredentials?.username || !student.lmsCredentials?.password) {
      return res.status(400).json({ error: { message: 'LMS credentials not linked. Please add your credentials first.', code: 'NO_CREDENTIALS' } });
    }

    if (!student.lmsCredentials.syncEnabled) {
      return res.status(400).json({ error: { message: 'LMS sync is disabled for this account.', code: 'SYNC_DISABLED' } });
    }

    // Decrypt password to pass to lms-sync-service
    const plainPassword = decrypt(student.lmsCredentials.password);

    // Fire-and-forget sync
    axios.post(
      `${LMS_SYNC_SERVICE_URL}/sync/student`,
      {
        studentId: student._id.toString(),
        username: student.lmsCredentials.username,
        password: plainPassword,
      },
      {
        headers: { 'x-internal-secret': MAIN_BACKEND_SECRET },
        timeout: 8000,
      }
    ).catch((err) => {
      logger.error(`LMS sync service unreachable: ${err.message}`);
    });

    // Update lastSync timestamp optimistically
    student.lmsCredentials.lastSync = new Date();
    await student.save();

    logger.info(`LMS sync triggered for student ${student._id}`);
    res.json({ success: true, message: 'Sync started. Your deadlines will update shortly.' });
  } catch (err) {
    logger.error('triggerSync error', { error: err.message });
    res.status(500).json({ error: { message: 'Failed to trigger sync', code: 'SYNC_TRIGGER_FAILED' } });
  }
};

// ── GET /api/v1/lms/assignments ───────────────────────────────────────────────
// Return upcoming LMS deadlines for the logged-in student's combination.
// Merges assignments from all LMS-synced students in the same combination.
exports.getAssignments = async (req, res) => {
  try {
    const user = req.user;
    if (!user.studentRef) {
      return res.status(200).json({ success: true, data: [], lmsLinked: false });
    }

    const studentId = user.studentRef._id || user.studentRef;
    const student = await Student.findById(studentId)
      .select('lmsCredentials level currentSemester combination')
      .lean();

    const ownLmsLinked = !!(student?.lmsCredentials?.username);

    // ── Build the pool of students to pull deadlines from ──────────────────
    // Always include the logged-in student.
    // If they have a combination set, also include all LMS-synced peers in that combination.
    let studentIds = [studentId];

    if (student?.combination) {
      const peers = await Student.find({
        combination: student.combination,
        _id: { $ne: studentId },
        'lmsCredentials.username': { $exists: true, $ne: null },
        'lmsCredentials.syncEnabled': true,
      }).select('_id').lean();

      studentIds = [studentId, ...peers.map(p => p._id)];
    } else if (student?.level && student?.currentSemester) {
      // Fallback: match by level + semester if combination not set
      const peers = await Student.find({
        level: student.level,
        currentSemester: student.currentSemester,
        _id: { $ne: studentId },
        'lmsCredentials.username': { $exists: true, $ne: null },
        'lmsCredentials.syncEnabled': true,
      }).select('_id').lean();

      studentIds = [studentId, ...peers.map(p => p._id)];
    }

    // ── Fetch all upcoming assignments from the pool ────────────────────────
    const raw = await LmsAssignment.find({
      student: { $in: studentIds },
      isCompleted: false,
      $or: [
        { dueDate: null },
        { dueDate: { $gte: new Date(Date.now() - 86400000) } }, // include "due yesterday" as overdue
      ],
    })
      .sort({ dueDate: 1 })
      .lean();

    // ── Deduplicate by moduleCode + title + day ────────────────────────────
    // If two students share the same assignment, only show it once.
    const seen = new Set();
    const deduplicated = [];
    for (const a of raw) {
      const dayKey = a.dueDate ? new Date(a.dueDate).toISOString().slice(0, 10) : 'null';
      const key = `${(a.moduleCode || '').toUpperCase()}|${a.title.toLowerCase().trim()}|${dayKey}`;
      // Prefer the logged-in student's own record (so isCompleted toggle works)
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(a);
      }
    }

    res.json({
      success: true,
      lmsLinked: ownLmsLinked,
      syncEnabled: !!(student?.lmsCredentials?.syncEnabled),
      lastSync: student?.lmsCredentials?.lastSync || null,
      lmsUsername: student?.lmsCredentials?.username || null,
      combination: student?.combination || null,
      level: student?.level || null,
      semester: student?.currentSemester || null,
      data: deduplicated,
    });
  } catch (err) {
    logger.error('getAssignments error', { error: err.message });
    res.status(500).json({ error: { message: 'Failed to fetch assignments', code: 'FETCH_FAILED' } });
  }
};


// ── PATCH /api/v1/lms/assignments/:id/complete ───────────────────────────────
// Toggle completed status for an assignment.
exports.toggleComplete = async (req, res) => {
  try {
    const assignment = await LmsAssignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: { message: 'Assignment not found', code: 'NOT_FOUND' } });
    }
    assignment.isCompleted = !assignment.isCompleted;
    await assignment.save();
    res.json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to update assignment', code: 'UPDATE_FAILED' } });
  }
};
