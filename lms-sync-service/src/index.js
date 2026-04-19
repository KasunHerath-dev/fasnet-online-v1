// src/index.js
//
// LMS Sync Service — Express server
// Runs on a separate port from your main MERN backend.
// Exposes REST endpoints so your main backend can trigger syncs,
// and a cron job for automatic scheduled syncing.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const axios = require('axios');

const { syncStudent, syncAllStudents } = require('./syncService');
const { parseICSFile } = require('./icsParser');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 4000;
const MAIN_BACKEND_URL = process.env.MAIN_BACKEND_URL || 'http://localhost:5000';
const MAIN_BACKEND_SECRET = process.env.MAIN_BACKEND_SECRET || '';

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

/**
 * Simple internal auth middleware.
 * All routes are protected by the shared secret.
 */
function requireSecret(req, res, next) {
  const secret = req.headers['x-internal-secret'];
  if (!MAIN_BACKEND_SECRET || secret === MAIN_BACKEND_SECRET) {
    return next();
  }
  logger.warn(`Unauthorized request from ${req.ip}`);
  return res.status(401).json({ error: 'Unauthorized' });
}

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'lms-sync-service',
    timestamp: new Date().toISOString(),
  });
});

// ── Trigger sync for a single student ────────────────────────────────────────
//
// POST /sync/student
// Headers: x-internal-secret: <your secret>
// Body: { studentId, username, password }
//
// Called by your main MERN backend when a student logs in or manually
// requests a refresh.
app.post('/sync/student', requireSecret, async (req, res) => {
  const { studentId, username, password } = req.body;

  if (!studentId || !username || !password) {
    return res.status(400).json({
      error: 'studentId, username, and password are required.',
    });
  }

  // Respond immediately — sync runs in background
  res.json({
    message: `Sync started for student ${studentId}`,
    studentId,
  });

  // Run sync asynchronously
  syncStudent({ studentId, username, password }).catch((err) =>
    logger.error(`Background sync error: ${err.message}`)
  );
});

// ── Trigger sync for multiple students ────────────────────────────────────────
//
// POST /sync/batch
// Headers: x-internal-secret: <your secret>
// Body: { students: [{ studentId, username, password }, ...] }
//
app.post('/sync/batch', requireSecret, async (req, res) => {
  const { students } = req.body;

  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ error: 'students array is required.' });
  }

  res.json({
    message: `Batch sync started for ${students.length} student(s)`,
    count: students.length,
  });

  syncAllStudents(students).catch((err) =>
    logger.error(`Batch sync error: ${err.message}`)
  );
});

// ── Trigger sync for ALL enabled students (called by admin panel) ─────────────
//
// POST /sync/all
// Headers: x-internal-secret: <your secret>
//
app.post('/sync/all', requireSecret, async (req, res) => {
  try {
    const response = await axios.get(
      `${MAIN_BACKEND_URL}/api/internal/students/lms-credentials`,
      {
        headers: { 'x-internal-secret': MAIN_BACKEND_SECRET },
        timeout: 10000,
      }
    );

    const students = response.data?.students || [];
    if (students.length === 0) {
      return res.json({ message: 'No students with LMS credentials found.', count: 0 });
    }

    res.json({
      message: `Sync triggered for ${students.length} student(s)`,
      count: students.length,
    });

    syncAllStudents(students).catch((err) =>
      logger.error(`Sync-all error: ${err.message}`)
    );
  } catch (err) {
    logger.error(`/sync/all error: ${err.message}`);
    res.status(503).json({ error: 'Could not fetch student credentials from backend.' });
  }
});

// ── Trigger full system audit (All students sync + Coverage check) ─────────
// POST /sync/system-audit
app.post('/sync/system-audit', requireSecret, async (req, res) => {
  logger.info(`🚨 Manual System Audit triggered: ${new Date().toISOString()}`);
  
  // Respond immediately
  res.json({ message: 'Full system sync and coverage audit started in background.' });

  try {
    const response = await axios.get(
      `${MAIN_BACKEND_URL}/api/internal/students/lms-credentials`,
      {
        headers: { 'x-internal-secret': MAIN_BACKEND_SECRET },
        timeout: 10000,
      }
    );

    const students = response.data?.students || [];
    if (students.length > 0) {
      await syncAllStudents(students);
    }

    // Run coverage check
    await axios.post(
      `${MAIN_BACKEND_URL}/api/internal/lms-coverage-check`,
      {},
      {
        headers: { 'x-internal-secret': MAIN_BACKEND_SECRET },
        timeout: 15000,
      }
    );
  } catch (err) {
    logger.error(`Manual System Audit failed: ${err.message}`);
  }
});

// ── Test endpoint: parse a local ICS file (dev/debug only) ───────────────────
//
// POST /debug/parse-ics
// Body: { filePath: '/absolute/path/to/file.ics' }
//
app.post('/debug/parse-ics', requireSecret, (req, res) => {
  const { filePath } = req.body;
  if (!filePath) return res.status(400).json({ error: 'filePath required' });
  try {
    const assignments = parseICSFile(filePath);
    res.json({ count: assignments.length, assignments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Scheduled Cron Job ───────────────────────────────────────────────────────
//
// Fetches all active students from the main backend and syncs each one.
// Default: every day at 6:00 AM server time.
//
const SYNC_CRON = process.env.SYNC_CRON || '0 6 * * *';

cron.schedule(SYNC_CRON, async () => {
  logger.info(`⏰ Cron triggered: ${new Date().toISOString()}`);
  try {
    // Fetch list of students with stored LMS credentials from your main backend
    const response = await axios.get(
      `${MAIN_BACKEND_URL}/api/internal/students/lms-credentials`,
      {
        headers: { 'x-internal-secret': MAIN_BACKEND_SECRET },
        timeout: 10000,
      }
    );

    const students = response.data?.students || [];
    if (students.length === 0) {
      logger.info('Cron: No students to sync.');
    } else {
      logger.info(`Cron: Syncing ${students.length} student(s)...`);
      await syncAllStudents(students);
    }
  } catch (err) {
    logger.error(`Cron sync failed: ${err.message}`);
  }

  // ── Coverage check: alert admins for combinations with zero LMS accounts ──
  // Runs regardless of whether any sync happened — catches totally uncovered groups.
  try {
    const coverageRes = await axios.post(
      `${MAIN_BACKEND_URL}/api/internal/lms-coverage-check`,
      {},
      {
        headers: { 'x-internal-secret': MAIN_BACKEND_SECRET },
        timeout: 15000,
      }
    );
    const { checked, uncovered, alertsSent } = coverageRes.data;
    if (alertsSent > 0) {
      logger.warn(`[Coverage] ${alertsSent} combination(s) with 0 LMS accounts — admins alerted. Uncovered: ${uncovered.join(', ')}`);
    } else {
      logger.info(`[Coverage] All ${checked} combination(s) have ≥1 LMS account linked. ✅`);
    }
  } catch (coverageErr) {
    logger.error(`[Coverage] Check failed: ${coverageErr.message}`);
  }
});

logger.info(`Cron schedule set: "${SYNC_CRON}"`);

// ── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`🚀 LMS Sync Service running on port ${PORT}`);
  logger.info(`   Main backend: ${MAIN_BACKEND_URL}`);
});

module.exports = app;
