// src/routes/lmsRoutes.js
// Student-facing LMS routes — all require authentication.

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  saveCredentials,
  removeCredentials,
  triggerSync,
  getAssignments,
  toggleComplete,
} = require('../controllers/lmsController');

router.use(protect);

router.post('/credentials', saveCredentials);
router.delete('/credentials', removeCredentials);
router.post('/sync/trigger', triggerSync);
router.get('/assignments', getAssignments);
router.patch('/assignments/:id/complete', toggleComplete);

module.exports = router;
