const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: true
    },
    type: {
        type: String,
        enum: ['Tutorial', 'Quiz', 'Assignment', 'Mid', 'End'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true // e.g., "Tutorial 01", "Mid Semester Exam"
    },
    maxMarks: {
        type: Number,
        required: true,
        min: 0,
        default: 100
    },
    batchYear: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for efficient querying
assessmentSchema.index({ module: 1, batchYear: 1, type: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
