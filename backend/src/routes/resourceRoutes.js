const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const resourceController = require('../controllers/resourceController');
const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB Limit
}); // Store in memory for direct stream to Drive

const router = express.Router();

// Resource Management
router.post('/', protect, authorize('admin', 'superadmin', 'editor'), upload.single('file'), resourceController.uploadResource);
router.post('/sync-cloudinary', protect, authorize('admin', 'superadmin'), resourceController.scanCloudinaryResources);
router.get('/mega-pending', protect, authorize('superadmin'), resourceController.getPendingMegaResources);
router.post('/migrate-single/:id', protect, authorize('superadmin'), resourceController.migrateSingleResource);
router.post('/init-folders', protect, authorize('superadmin'), resourceController.initCloudinaryFolders);
router.get('/sync-preview', protect, authorize('admin', 'superadmin'), resourceController.getCloudinarySyncPreview);
router.get('/module/:moduleId', protect, resourceController.getResourcesByModule);
router.post('/my-resources', protect, resourceController.getBulkResources);
router.delete('/:id', protect, authorize('admin', 'superadmin'), resourceController.deleteResource);
router.get('/stream/:id', resourceController.streamResource); // Public stream/download link

module.exports = router;
