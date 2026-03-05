const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const { authMiddleware } = require('../middleware/auth');

// Public/Bot endpoint (protected by botSecret internally in controller) or Admin
router.post('/', noticeController.createNotice);

// Private endpoint for students/dashboard
router.get('/', authMiddleware, noticeController.getNotices);

module.exports = router;
