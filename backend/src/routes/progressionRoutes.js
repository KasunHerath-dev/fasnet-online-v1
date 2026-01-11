const express = require('express');
const router = express.Router();
const progressionController = require('../controllers/progressionController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Enrollment
router.post('/enroll', authMiddleware, roleMiddleware('admin', 'superadmin'), progressionController.enrollModules);

// Results & Progression
router.post('/calculate', authMiddleware, roleMiddleware('admin', 'superadmin'), progressionController.calculateSemesterResults);

// Analytics
router.get('/analytics', authMiddleware, roleMiddleware('admin', 'superadmin'), progressionController.getBatchAnalytics);

// Student History
router.get('/history/:studentId', authMiddleware, progressionController.getStudentHistory);

module.exports = router;
