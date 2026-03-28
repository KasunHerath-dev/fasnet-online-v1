const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const driveSettingsController = require('../controllers/driveSettingsController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');

// Memory storage for JSON file scanning
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit for JSON
});

// Public route to get site logo
router.get('/logo', settingsController.getLogo);

// Google Drive Configuration Routes
router.post('/drive/scan', protect, authorize('admin', 'superadmin'), upload.single('credentials'), driveSettingsController.scanGoogleDrive);
router.post('/drive/save', protect, authorize('admin', 'superadmin'), driveSettingsController.saveGoogleDriveConfig);

// Active Storage Configuration Routes
router.get('/storage/active', protect, authorize('admin', 'superadmin'), driveSettingsController.getActiveStorage);
router.post('/storage/active', protect, authorize('admin', 'superadmin'), driveSettingsController.setActiveStorage);

module.exports = router;
