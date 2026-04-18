const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const driveSettingsController = require('../controllers/driveSettingsController');
const migrationController = require('../controllers/migrationController');
const aiSettingsController = require('../controllers/aiSettingsController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');

// Memory storage for JSON file scanning
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit for JSON
});

// AI Configuration Routes
router.get('/ai/gemini', protect, authorize('admin', 'superadmin'), aiSettingsController.getGeminiConfig);
router.post('/ai/gemini', protect, authorize('admin', 'superadmin'), aiSettingsController.updateGeminiConfig);
router.post('/ai/gemini/test', protect, authorize('admin', 'superadmin'), aiSettingsController.testGeminiConfig);

// Public route to get site logo
router.get('/logo', settingsController.getLogo);

// Google Drive Configuration Routes
router.post('/drive/scan', protect, authorize('admin', 'superadmin'), upload.single('credentials'), driveSettingsController.scanGoogleDrive);
router.post('/drive/save', protect, authorize('admin', 'superadmin'), driveSettingsController.saveGoogleDriveConfig);

// Active Storage Configuration Routes
router.get('/storage/active', protect, authorize('admin', 'superadmin'), driveSettingsController.getActiveStorage);
router.post('/storage/active', protect, authorize('admin', 'superadmin'), driveSettingsController.setActiveStorage);
router.get('/storage/health', protect, authorize('admin', 'superadmin'), driveSettingsController.getStorageHealth);

// Visual Explorer GUI Routes
router.get('/drive/explore', protect, authorize('admin', 'superadmin'), driveSettingsController.exploreDriveFolder);
router.get('/drive/explore-mega', protect, authorize('admin', 'superadmin'), driveSettingsController.exploreMegaFolder);

// Migration Toolkit Routes
router.get('/migration/stats', protect, authorize('admin', 'superadmin'), migrationController.getMigrationStats);
router.get('/migration/status', protect, authorize('admin', 'superadmin'), migrationController.getMigrationStatus);
router.get('/migration/map', protect, authorize('admin', 'superadmin'), migrationController.getMigrationMap);
router.get('/migration/audit', protect, authorize('admin', 'superadmin'), migrationController.auditMigration);
router.post('/migration/start', protect, authorize('admin', 'superadmin'), migrationController.startMigration);
router.post('/migration/stop', protect, authorize('admin', 'superadmin'), migrationController.stopMigration);

module.exports = router;
