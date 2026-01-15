const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { applyBatchScope, validateBatchScope } = require('../middleware/batchScope');

// Apply batch scope middleware to all routes
router.use(authMiddleware);
router.use(applyBatchScope);

router.get('/', studentController.getAllStudents);
router.get('/demographics', studentController.getDemographics);
router.get('/birthdays/upcoming', studentController.getUpcomingBirthdays);
router.put('/me', studentController.updateMyProfile);
router.get('/:registrationNumber', studentController.getStudentByRegNum);
router.post('/', roleMiddleware('superadmin', 'admin'), validateBatchScope, studentController.createStudent);
router.put('/:registrationNumber', roleMiddleware('superadmin', 'admin'), validateBatchScope, studentController.updateStudent);
router.delete('/:registrationNumber', roleMiddleware('superadmin', 'admin'), studentController.deleteStudent);
router.delete('/', roleMiddleware('superadmin'), studentController.deleteAllStudents);
router.post('/create-missing-users', roleMiddleware('superadmin', 'admin'), studentController.createMissingUserAccounts);

module.exports = router;
