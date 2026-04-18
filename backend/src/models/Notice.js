const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a notice title'],
        trim: true
    },
    originalTitle: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        trim: true
    },
    subtext: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['important', 'success', 'info', 'default'],
        default: 'default'
    },
    date: {
        type: String,
        required: [true, 'Please provide a display date']
    },
    sourceUrl: {
        type: String,
        trim: true
    },
    hash: {
        type: String,
        unique: true,
        sparse: true // Allow null/missing for old notices
    },
    attachments: [{
        filename: String,
        url: String,
        localPath: String,
        mimeType: String,
        sizeBytes: Number
    }],
    status: {
        type: String,
        enum: ['published', 'draft'],
        default: 'published' // Default to published for manual/old entries
    },
    publishedAt: {
        type: Date
    },
    tags: [String],
    isActive: {
        type: Boolean,
        default: true
    },
    aiProcessed: {
        type: Boolean,
        default: false   // true = AI rewrote this; false = original content used
    }
}, {
    timestamps: true
});

// Auto-delete notices after 180 days (increased from 60 to keep archive)
noticeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

module.exports = mongoose.model('Notice', noticeSchema);
