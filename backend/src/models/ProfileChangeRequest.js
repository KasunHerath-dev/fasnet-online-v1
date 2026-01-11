const mongoose = require('mongoose');

const profileChangeRequestSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    requestedChanges: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        required: true
    },
    reason: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    adminComments: {
        type: String,
        trim: true
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ProfileChangeRequest', profileChangeRequestSchema);
