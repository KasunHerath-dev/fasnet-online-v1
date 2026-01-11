const mongoose = require('mongoose');

const assessmentResultSchema = new mongoose.Schema({
    assessment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    marks: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

// Prevent duplicate results for the same assessment and student
assessmentResultSchema.index({ assessment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('AssessmentResult', assessmentResultSchema);
