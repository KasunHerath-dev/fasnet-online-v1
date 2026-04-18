// src/syncService.js
//
// Orchestrates the full sync flow for one or many students:
//   1. Download the student's ICS calendar from LMS (Puppeteer)
//   2. Parse the ICS file into structured assignment data
//   3. Dispatch to the main MERN backend notification system
//   4. Clean up temp files

const fs = require('fs');
const { downloadStudentCalendar } = require('./lmsScraper');
const { parseICSFile } = require('./icsParser');
const { dispatchAssignments } = require('./notificationDispatcher');
const logger = require('./utils/logger');

/**
 * Run the full sync for a single student.
 *
 * @param {{ studentId: string, username: string, password: string }} student
 * @returns {Promise<{ studentId, assignments, dispatched }>}
 */
async function syncStudent(student) {
  const { studentId, username, password } = student;
  let icsFilePath = null;

  try {
    logger.info(`━━━ Starting sync for student: ${studentId} ━━━`);

    // Step 1: Download ICS from LMS
    icsFilePath = await downloadStudentCalendar(username, password, studentId);

    // Step 2: Parse ICS into structured data
    const assignments = parseICSFile(icsFilePath);

    // Log summary
    assignments.forEach((a) => {
      logger.info(
        `  → [${a.moduleCode || 'UNKNOWN'}] ${a.type.toUpperCase()}: "${a.title}" | Due: ${a.dueDateISO}`
      );
    });

    // Step 3: Dispatch to main backend
    const dispatchResult = await dispatchAssignments(studentId, assignments);

    logger.info(`━━━ Sync complete for student: ${studentId} ━━━`);
    return { studentId, assignments, dispatched: dispatchResult };
  } catch (err) {
    logger.error(`Sync failed for student ${studentId}: ${err.message}`);
    return { studentId, error: err.message };
  } finally {
    // Step 4: Clean up temp ICS file
    if (icsFilePath && fs.existsSync(icsFilePath)) {
      fs.unlinkSync(icsFilePath);
      logger.info(`Cleaned up temp file: ${icsFilePath}`);
    }
  }
}

/**
 * Run sync for multiple students (sequentially to avoid IP bans).
 *
 * @param {Array<{ studentId, username, password }>} students
 * @returns {Promise<Array>}
 */
async function syncAllStudents(students) {
  logger.info(`Starting batch sync for ${students.length} student(s)...`);
  const results = [];

  for (const student of students) {
    const result = await syncStudent(student);
    results.push(result);

    // Small delay between students to be polite to the LMS server
    if (students.indexOf(student) < students.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  const succeeded = results.filter((r) => !r.error).length;
  const failed = results.filter((r) => r.error).length;
  logger.info(`Batch sync done. ✓ ${succeeded} succeeded | ✗ ${failed} failed.`);
  return results;
}

module.exports = { syncStudent, syncAllStudents };
