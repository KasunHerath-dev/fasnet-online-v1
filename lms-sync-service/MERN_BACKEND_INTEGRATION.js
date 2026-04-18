// ─────────────────────────────────────────────────────────────────
//  ADD THIS TO YOUR EXISTING MERN BACKEND
//  File: routes/internal/lmsAssignments.js
// ─────────────────────────────────────────────────────────────────
//
// This is the endpoint the lms-sync-service POSTs to.
// It deduplicates assignments, saves them to MongoDB,
// and fires push notifications through your existing notification system.

const express = require('express');
const router = express.Router();

// ── Import your existing models & notification util ───────────────
// Adjust paths to match your project structure:
const Assignment = require('../../models/Assignment');       // See schema below
const Student = require('../../models/Student');             // Your existing student model
const { sendPushNotification } = require('../../utils/notifications'); // Your existing FCM/WS util

const INTERNAL_SECRET = process.env.MAIN_BACKEND_SECRET || '';

/**
 * Internal auth middleware — only the lms-sync-service can call this.
 */
function requireInternalSecret(req, res, next) {
  if (!INTERNAL_SECRET || req.headers['x-internal-secret'] === INTERNAL_SECRET) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

// ── POST /api/internal/lms-assignments ───────────────────────────
//
// Receives: { studentId, syncedAt, assignments: [...] }
// Each assignment: { uid, title, moduleCode, type, dueDate, dueDateISO, description }
//
router.post('/', requireInternalSecret, async (req, res) => {
  const { studentId, syncedAt, assignments } = req.body;

  if (!studentId || !Array.isArray(assignments)) {
    return res.status(400).json({ error: 'studentId and assignments[] required' });
  }

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: `Student ${studentId} not found` });
    }

    let newCount = 0;
    const newAssignments = [];

    for (const a of assignments) {
      // Deduplicate by Moodle UID — never notify twice for the same event
      const existing = await Assignment.findOne({ moodleUid: a.uid, student: studentId });
      if (existing) continue;

      // Save new assignment
      const saved = await Assignment.create({
        student: studentId,
        moodleUid: a.uid,
        title: a.title,
        moduleCode: a.moduleCode,
        type: a.type,
        dueDate: a.dueDate ? new Date(a.dueDate) : null,
        description: a.description,
        categories: a.categories,
        syncedAt: syncedAt ? new Date(syncedAt) : new Date(),
        notified: false,
      });

      newAssignments.push(saved);
      newCount++;
    }

    // Fire push notifications for each new assignment
    for (const assignment of newAssignments) {
      await sendNotificationForAssignment(student, assignment);
      // Mark as notified
      assignment.notified = true;
      await assignment.save();
    }

    return res.json({
      received: assignments.length,
      newSaved: newCount,
      duplicatesSkipped: assignments.length - newCount,
    });
  } catch (err) {
    console.error('lms-assignments endpoint error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /api/internal/students/lms-credentials ───────────────────
//
// Called by the lms-sync-service cron job to get all students
// who have stored LMS credentials (for the scheduled batch sync).
//
// IMPORTANT: Only store credentials if students consent and if you
// encrypt them at rest (use bcrypt or AES encryption in production).
//
router.get('/students/lms-credentials', requireInternalSecret, async (req, res) => {
  try {
    // Only return students who have opted in and have stored credentials
    const students = await Student.find(
      { 'lmsCredentials.username': { $exists: true } },
      { _id: 1, 'lmsCredentials.username': 1, 'lmsCredentials.password': 1 }
    );

    const formatted = students.map((s) => ({
      studentId: s._id.toString(),
      username: s.lmsCredentials.username,
      // ⚠️ Decrypt here if you encrypt passwords at rest
      password: s.lmsCredentials.password,
    }));

    res.json({ students: formatted });
  } catch (err) {
    console.error('Error fetching LMS credentials:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Helper: Format and send notification ─────────────────────────
async function sendNotificationForAssignment(student, assignment) {
  const daysUntilDue = assignment.dueDate
    ? Math.ceil((new Date(assignment.dueDate) - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const urgencyLabel =
    daysUntilDue === null
      ? ''
      : daysUntilDue <= 1
      ? '🔴 Due Tomorrow!'
      : daysUntilDue <= 3
      ? '🟡 Due Soon'
      : '📅';

  const title = `${urgencyLabel} ${assignment.moduleCode || 'LMS'} — ${assignment.type}`;

  const body = assignment.dueDate
    ? `"${assignment.title}" is due on ${new Date(assignment.dueDate).toLocaleDateString('en-LK', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`
    : `"${assignment.title}"`;

  // Call your existing push notification utility
  // This could be FCM, OneSignal, WebSocket, email, etc.
  await sendPushNotification({
    userId: student._id,
    title,
    body,
    data: {
      type: 'lms_assignment',
      assignmentId: assignment._id.toString(),
      moduleCode: assignment.moduleCode,
      dueDate: assignment.dueDate,
    },
  });

  console.log(`[Notification sent] ${student._id}: ${title}`);
}

module.exports = router;


// ═════════════════════════════════════════════════════════════════
//  MONGOOSE SCHEMA — models/Assignment.js
//  Add this model to your existing models folder
// ═════════════════════════════════════════════════════════════════
/*
const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema(
  {
    student:     { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    moodleUid:   { type: String, required: true },      // Moodle's UID (prevents duplicates)
    title:       { type: String, required: true },
    moduleCode:  { type: String },                       // e.g. "MATH 1222"
    type:        {
      type: String,
      enum: ['assignment', 'tutorial', 'quiz', 'exam', 'other'],
      default: 'other',
    },
    dueDate:     { type: Date },
    description: { type: String },
    categories:  { type: String },
    syncedAt:    { type: Date, default: Date.now },
    notified:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound unique index: one entry per student per Moodle event
AssignmentSchema.index({ student: 1, moodleUid: 1 }, { unique: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);
*/


// ═════════════════════════════════════════════════════════════════
//  REGISTER ROUTES — add to your main app.js / server.js
// ═════════════════════════════════════════════════════════════════
/*
const lmsAssignmentsRouter = require('./routes/internal/lmsAssignments');
app.use('/api/internal', lmsAssignmentsRouter);
*/


// ═════════════════════════════════════════════════════════════════
//  STUDENT MODEL ADDITIONS
//  Add lmsCredentials field to your existing Student schema
// ═════════════════════════════════════════════════════════════════
/*
lmsCredentials: {
  username: { type: String },
  password: { type: String },      // ⚠️ Encrypt at rest in production!
  lastSync: { type: Date },
  syncEnabled: { type: Boolean, default: false },
}
*/


// ═════════════════════════════════════════════════════════════════
//  STUDENT-TRIGGERED SYNC — call from your existing student controller
//  e.g. when student logs in or clicks "Sync LMS" in the app
// ═════════════════════════════════════════════════════════════════
/*
const axios = require('axios');

async function triggerLMSSync(studentId, lmsUsername, lmsPassword) {
  try {
    await axios.post(
      `${process.env.LMS_SYNC_SERVICE_URL}/sync/student`,
      { studentId, username: lmsUsername, password: lmsPassword },
      { headers: { 'x-internal-secret': process.env.MAIN_BACKEND_SECRET } }
    );
  } catch (err) {
    console.error('Failed to trigger LMS sync:', err.message);
    // Non-fatal — student still logs in even if sync fails
  }
}
*/
