const ProfileChangeRequest = require('../models/ProfileChangeRequest');
const Student = require('../models/Student');
const logger = require('../utils/logger');

// Submit a new change request
exports.createRequest = async (req, res) => {
    try {
        const { studentId, changes, reason } = req.body;

        // Validate that student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }

        // Ensure authorized (student can only request for themselves)
        // Assuming middleware puts user in req.user
        // In a real scenario, check if req.user.studentRef === studentId

        const newRequest = await ProfileChangeRequest.create({
            student: studentId,
            requestedChanges: changes,
            reason
        });

        res.status(201).json({
            success: true,
            message: 'Profile update request submitted successfully',
            data: newRequest
        });
    } catch (error) {
        logger.error('Error creating profile request', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Get requests (Admin: all, Student: specific)
exports.getRequests = async (req, res) => {
    try {
        const { status, studentId } = req.query;
        let query = {};

        if (status) query.status = status;
        if (studentId) query.student = studentId;

        const requests = await ProfileChangeRequest.find(query)
            .populate('student')
            .populate('reviewedBy', 'username')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        logger.error('Error fetching profile requests', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Approve a request
exports.approveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { comments } = req.body;

        const request = await ProfileChangeRequest.findById(id);
        if (!request) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }

        if (request.status !== 'Pending') {
            return res.status(400).json({ success: false, error: `Request is already ${request.status}` });
        }

        // Apply changes to Student
        const student = await Student.findById(request.student);
        if (!student) {
            return res.status(404).json({ success: false, error: 'Student associated with this request not found' });
        }

        // Update fields
        // Update fields
        // requestedChanges is a Map, but we'll handle both Map and Object for robustness
        const changes = request.requestedChanges instanceof Map
            ? Object.fromEntries(request.requestedChanges)
            : request.requestedChanges;

        Object.entries(changes).forEach(([key, value]) => {
            student[key] = value;
        });

        await student.save();

        // Update request status
        request.status = 'Approved';
        request.adminComments = comments;
        request.reviewedBy = req.user._id; // Assuming auth middleware
        request.reviewedAt = Date.now();
        await request.save();

        res.status(200).json({
            success: true,
            message: 'Request approved and profile updated',
            data: request
        });
    } catch (error) {
        logger.error('Error approving profile request', error);
        res.status(500).json({ success: false, error: error.message || 'Server Error' });
    }
};

// Reject a request
exports.rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { comments } = req.body;

        const request = await ProfileChangeRequest.findById(id);
        if (!request) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }

        if (request.status !== 'Pending') {
            return res.status(400).json({ success: false, error: `Request is already ${request.status}` });
        }

        request.status = 'Rejected';
        request.adminComments = comments;
        request.reviewedBy = req.user._id;
        request.reviewedAt = Date.now();
        await request.save();

        res.status(200).json({
            success: true,
            message: 'Request rejected',
            data: request
        });
    } catch (error) {
        logger.error('Error rejecting profile request', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
