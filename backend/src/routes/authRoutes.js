const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getCurrentUser);
router.post('/change-password', authMiddleware, authController.changePassword);
router.post('/preferences', authMiddleware, authController.updatePreferences);

module.exports = router;
