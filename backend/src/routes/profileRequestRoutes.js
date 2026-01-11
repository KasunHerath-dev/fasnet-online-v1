const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createRequest,
    getRequests,
    approveRequest,
    rejectRequest
} = require('../controllers/profileRequestController');

// Submit request (Student & Admin)
router.post('/', protect, createRequest);

// Get all requests (Admin) or filtered by query
router.get('/', protect, getRequests);

// Approve/Reject (Admin only)
router.put('/:id/approve', protect, authorize('admin', 'superadmin'), approveRequest);
router.put('/:id/reject', protect, authorize('admin', 'superadmin'), rejectRequest);

module.exports = router;
