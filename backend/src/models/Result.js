const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: true
    },
    marks: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    grade: {
        type: String,
        required: true
    },
    gradePoint: {
        type: Number,
        required: true
    },
    attempt: {
        type: Number,
        default: 1
    },
    academicYear: {
        type: String // e.g., "2023/2024"
    }
}, {
    timestamps: true
});

// Prevent duplicate results for same student/module/attempt
resultSchema.index({ student: 1, module: 1, attempt: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
