// src/syncNow.js
//
// One-shot CLI script to manually trigger a sync for a single student.
// Usage:
//   LMS_USERNAME=s242074 LMS_PASSWORD=secret node src/syncNow.js
// Or set values in .env and just run:
//   node src/syncNow.js

require('dotenv').config();
const { syncStudent } = require('./syncService');
const logger = require('./utils/logger');

const student = {
  studentId: process.env.LMS_STUDENT_ID || process.env.LMS_USERNAME || 'test-student',
  username: process.env.LMS_USERNAME,
  password: process.env.LMS_PASSWORD,
};

if (!student.username || !student.password) {
  logger.error('LMS_USERNAME and LMS_PASSWORD must be set in .env or environment.');
  process.exit(1);
}

(async () => {
  logger.info(`Manual sync triggered for: ${student.studentId}`);
  const result = await syncStudent(student);
  if (result.error) {
    logger.error(`Sync failed: ${result.error}`);
    process.exit(1);
  }
  logger.info(`Sync complete. ${result.assignments?.length || 0} assignment(s) processed.`);
  process.exit(0);
})();
