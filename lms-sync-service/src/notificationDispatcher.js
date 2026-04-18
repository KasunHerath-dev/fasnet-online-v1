// src/notificationDispatcher.js
//
// Sends parsed assignment data to the main MERN backend.
// Your MERN backend then handles the actual push notification delivery
// (FCM, WebSocket, email, etc.) through its own notification system.

const axios = require('axios');
const logger = require('./utils/logger');

const MAIN_BACKEND_URL = process.env.MAIN_BACKEND_URL || 'http://localhost:5000';
const SECRET = process.env.MAIN_BACKEND_SECRET || '';

/**
 * Dispatch a batch of assignments for a specific student to the main backend.
 *
 * POST /api/internal/lms-assignments
 * Body: { studentId, assignments: [...] }
 *
 * The main backend is expected to:
 *   1. Deduplicate by uid (so no double notifications)
 *   2. Create or update assignment records
 *   3. Fire push notifications to the student
 *
 * @param {string} studentId
 * @param {Array}  assignments - Output from icsParser.parseICSFile()
 * @returns {Promise<Object>}  - Response from main backend
 */
async function dispatchAssignments(studentId, assignments) {
  if (!assignments || assignments.length === 0) {
    logger.info(`[${studentId}] No assignments to dispatch.`);
    return { sent: 0 };
  }

  const payload = {
    studentId,
    syncedAt: new Date().toISOString(),
    assignments,
  };

  logger.info(
    `[${studentId}] Dispatching ${assignments.length} assignment(s) to main backend...`
  );

  try {
    const response = await axios.post(
      `${MAIN_BACKEND_URL}/api/internal/lms-assignments`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          // Internal service-to-service auth header
          'x-internal-secret': SECRET,
        },
        timeout: 15000,
      }
    );

    logger.info(
      `[${studentId}] Backend accepted ${assignments.length} assignment(s). ` +
        `Status: ${response.status}`
    );
    return response.data;
  } catch (err) {
    const status = err.response?.status;
    const detail = err.response?.data || err.message;
    logger.error(
      `[${studentId}] Failed to dispatch to backend. Status: ${status}. Detail: ${JSON.stringify(detail)}`
    );
    throw err;
  }
}

/**
 * Dispatch assignments for multiple students in sequence.
 * Errors for individual students are logged but do not abort others.
 *
 * @param {Array<{ studentId, assignments }>} batch
 */
async function dispatchBatch(batch) {
  const results = [];
  for (const { studentId, assignments } of batch) {
    try {
      const result = await dispatchAssignments(studentId, assignments);
      results.push({ studentId, success: true, result });
    } catch (err) {
      results.push({ studentId, success: false, error: err.message });
    }
  }
  return results;
}

module.exports = { dispatchAssignments, dispatchBatch };
