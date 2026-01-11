const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const { authMiddleware: protect, roleMiddleware: authorize } = require('../middleware/auth');

router.get('/modules', protect, academicController.getModules);
router.get('/my-enrollments', protect, academicController.getMyEnrollments); // New Route
router.post('/modules', protect, authorize('admin', 'superadmin'), academicController.createModule);

router.post('/results', protect, authorize('admin', 'superadmin', 'editor'), academicController.addResult);
router.put('/results/:resultId', protect, authorize('admin', 'superadmin', 'editor'), academicController.updateResult);
router.get('/student/:studentId', protect, academicController.getStudentAcademicProfile);

// Assessment Routes
router.post('/assessments', protect, authorize('admin', 'superadmin', 'editor'), academicController.createAssessment);
router.post('/assessments/results', protect, authorize('admin', 'superadmin', 'editor'), academicController.addAssessmentResults);
router.post('/assessments/calculate-final', protect, authorize('admin', 'superadmin', 'editor'), academicController.calculateFinalGrade);

// Progression & Analytics Routes
router.post('/promote-batch', protect, authorize('admin'), academicController.promoteStudents);
router.get('/repeaters', protect, authorize('admin', 'editor'), academicController.getRepeaters);
router.get('/analytics/module', protect, authorize('admin', 'superadmin', 'editor'), academicController.getModuleAnalytics);
router.get('/analytics/batch', protect, authorize('admin', 'superadmin', 'editor'), academicController.getBatchAnalytics);

// Degree Selection Routes
router.get('/degree-candidates', protect, authorize('admin', 'editor'), academicController.getDegreeCandidates);
router.post('/assign-degree', protect, authorize('admin'), academicController.assignDegree);
// Combination Routes
router.post('/set-combination', protect, academicController.setCombination);
router.post('/unlock-combination', protect, authorize('admin', 'superadmin'), academicController.unlockCombination);
// Multer setup needed for upload
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
router.post('/bulk-combination', protect, authorize('admin', 'superadmin'), upload.single('file'), academicController.bulkUpdateCombination);

module.exports = router;
