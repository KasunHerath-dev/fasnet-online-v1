const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title for the resource'],
        trim: true
    },
    type: {
        type: String,
        enum: ['tutorial', 'past_paper', 'assignment', 'marking_scheme', 'book', 'other'],
        required: [true, 'Please specify the resource type']
    },
    answerFor: {
        type: String,
        enum: ['tutorial', 'assignment', 'past_paper', 'other'],
        required: function () { return this.type === 'marking_scheme'; }
    },
    module: {
        type: mongoose.Schema.ObjectId,
        ref: 'Module',
        required: true
    },
    fileId: {
        type: String,
        required: true
    },
    // storageType: { type: String, enum: ['google_drive', 'mega'], default: 'mega' }, // Optional for dual support
    webViewLink: {
        type: String,
        required: true
    },
    webContentLink: {
        type: String,
        required: true
    },
    mimeType: {
        type: String
    },
    size: {
        type: Number
    },
    uploadedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index to quickly list resources for a module
resourceSchema.index({ module: 1, type: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
