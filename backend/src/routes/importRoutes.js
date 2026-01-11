const express = require('express');
const router = express.Router();
const multer = require('multer');
const importController = require('../controllers/importController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/preview', authMiddleware, roleMiddleware('superadmin', 'admin'), upload.single('file'), importController.previewImport);
router.post('/students', authMiddleware, roleMiddleware('superadmin', 'admin'), upload.single('file'), importController.importStudents);

module.exports = router;
