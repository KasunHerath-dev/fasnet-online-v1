const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const resourceController = require('../controllers/resourceController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Store in memory for direct stream to Drive

const router = express.Router();

// Resource Management
router.post('/', protect, authorize('admin', 'superadmin', 'editor'), upload.single('file'), resourceController.uploadResource);
router.get('/module/:moduleId', protect, resourceController.getResourcesByModule);
router.delete('/:id', protect, authorize('admin', 'superadmin'), resourceController.deleteResource);
router.get('/stream/:id', resourceController.streamResource); // Public stream/download link

module.exports = router;
