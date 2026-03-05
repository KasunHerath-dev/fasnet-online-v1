const mongoose = require('mongoose');

/**
 * Notification types:
 *   resource_added   — new study resource uploaded for student's module
 *   account_verified — student account was verified
 *   password_changed — password successfully changed
 *   grade_published  — semester result published
 *   announcement     — general system announcement
 */
const notificationSchema = new mongoose.Schema({
    // Recipient student or user
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },

    type: {
        type: String,
        enum: ['resource_added', 'account_verified', 'password_changed', 'grade_published', 'announcement'],
        required: true,
    },

    title: {
        type: String,
        required: true,
        trim: true,
    },

    body: {
        type: String,
        required: true,
        trim: true,
    },

    // Optional URL to navigate to when clicking the notification
    link: {
        type: String,
        default: null,
    },

    // Reference to a related document (resource, result, etc.)
    refModel: {
        type: String,
        enum: ['Resource', 'SemesterResult', 'User', null],
        default: null,
    },
    refId: {
        type: mongoose.Schema.ObjectId,
        default: null,
    },

    isRead: {
        type: Boolean,
        default: false,
        index: true,
    },
}, {
    timestamps: true, // createdAt, updatedAt
});

// Clean up old notifications (TTL — auto-delete after 30 days)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', notificationSchema);
