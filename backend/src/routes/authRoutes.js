const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/request-otp', authController.requestOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/setup-password', authController.setupPassword);
router.get('/me', authMiddleware, authController.getCurrentUser);
router.post('/change-password', authMiddleware, authController.changePassword);
router.post('/preferences', authMiddleware, authController.updatePreferences);

router.post('/change-password/request-otp', authMiddleware, authController.requestPasswordChangeOTP);
router.post('/change-password/confirm', authMiddleware, authController.confirmPasswordChangeWithOTP);
router.post('/complete-profile-setup', authMiddleware, authController.completeProfileSetup);

module.exports = router;
