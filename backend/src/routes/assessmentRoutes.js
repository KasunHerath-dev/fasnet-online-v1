const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure Multer for Excel Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Ensure this directory exists or use /tmp
    },
    filename: function (req, file, cb) {
        cb(null, 'assessment-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheetml') || file.originalname.match(/\.(xlsx|xls|csv)$/)) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel/CSV files are allowed!'), false);
        }
    }
});

// Routes
// POST /api/v1/assessments/upload-results
router.post('/upload-results',
    authMiddleware,
    roleMiddleware('superadmin', 'admin'),
    upload.single('file'),
    assessmentController.uploadResults
);

module.exports = router;
