const express = require('express');
const router = express.Router();
const missingStudentController = require('../controllers/missingStudentController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, missingStudentController.getAllMissingStudents);
router.delete('/:id', authMiddleware, roleMiddleware('superadmin', 'admin'), missingStudentController.deleteMissingStudent);
router.delete('/', authMiddleware, roleMiddleware('superadmin', 'admin'), missingStudentController.deleteAllMissingStudents);
router.post('/:id/move', authMiddleware, roleMiddleware('superadmin', 'admin'), missingStudentController.moveToMainDatabase);

module.exports = router;
