// src/syncNow.js
//
// One-shot CLI script to manually trigger a sync for a single student.
// Usage:
//   LMS_USERNAME=s242074 LMS_PASSWORD=secret node src/syncNow.js
// Or set values in .env and just run:
//   node src/syncNow.js

require('dotenv').config();
const { syncStudent, syncAllStudents } = require('./syncService');
const logger = require('./utils/logger');
const axios = require('axios');

const MAIN_BACKEND_URL = process.env.MAIN_BACKEND_URL || 'http://localhost:5000';
const MAIN_BACKEND_SECRET = process.env.MAIN_BACKEND_SECRET || '';

(async () => {
  try {
    // 1. If username/password provided in env, sync just that one (Manual/Dev mode)
    if (process.env.LMS_USERNAME && process.env.LMS_PASSWORD) {
      const student = {
        studentId: process.env.LMS_STUDENT_ID || process.env.LMS_USERNAME,
        username: process.env.LMS_USERNAME,
        password: process.env.LMS_PASSWORD,
      };
      logger.info(`Manual sync triggered from ENV for: ${student.studentId}`);
      const result = await syncStudent(student);
      if (result.error) {
        logger.error(`Sync failed: ${result.error}`);
        process.exit(1);
      }
      process.exit(0);
    }

    // 2. Otherwise, fetch all students with credentials from the database
    logger.info('No ENV credentials found. Fetching all students from database...');
    
    if (!MAIN_BACKEND_SECRET) {
      logger.error('MAIN_BACKEND_SECRET is missing. Cannot fetch from database.');
      process.exit(1);
    }

    const response = await axios.get(
      `${MAIN_BACKEND_URL}/api/internal/students/lms-credentials`,
      {
        headers: { 'x-internal-secret': MAIN_BACKEND_SECRET },
        timeout: 15000,
      }
    );

    const students = response.data?.students || [];
    if (students.length === 0) {
      logger.info('No students with LMS credentials found in database.');
      process.exit(0);
    }

    logger.info(`Starting sync for ${students.length} student(s) from database...`);
    await syncAllStudents(students);
    
    logger.info('All database syncs completed.');
    process.exit(0);

  } catch (err) {
    logger.error(`Fatal sync error: ${err.message}`);
    process.exit(1);
  }
})();
