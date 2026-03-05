const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a notice title'],
        trim: true
    },
    subtext: {
        type: String,
        required: [true, 'Please provide notice subtext'],
        trim: true
    },
    type: {
        type: String,
        enum: ['important', 'success', 'info', 'default'],
        default: 'default'
    },
    date: {
        type: String,
        required: [true, 'Please provide a display date (e.g. "Today, 10:30 AM")']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Auto-delete notices after 60 days
noticeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 });

module.exports = mongoose.model('Notice', noticeSchema);
