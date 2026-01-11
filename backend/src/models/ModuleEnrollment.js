const mongoose = require('mongoose');

const moduleEnrollmentSchema = new mongoose.Schema({
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
    academicYear: {
        type: String, // "2024/2025"
        required: true
    },
    semester: {
        type: Number,
        required: true,
        enum: [1, 2]
    },
    level: {
        type: Number,
        required: true,
        enum: [1, 2, 3, 4]
    },
    isRepeat: {
        type: Boolean,
        default: false
    },
    attemptNumber: {
        type: Number,
        default: 1,
        max: 4 // Repeat Limit per user requirement
    },
    status: {
        type: String,
        enum: ['Enrolled', 'Completed', 'Withdrawn', 'Passed', 'Failed'],
        default: 'Enrolled'
    },
    type: {
        type: String,
        enum: ['Compulsory', 'Optional'],
        default: 'Compulsory'
    },
    // Results
    continuousAssessmentMark: { type: Number, default: 0 },
    endSemesterExamMark: { type: Number, default: 0 },
    finalMark: { type: Number },
    grade: { type: String },
    gradePoint: { type: Number },
    credits: { type: Number }, // Snapshot of credits at time of enrollment

    eligibility: {
        type: String,
        enum: ['Eligible', 'Not Eligible'],
        default: 'Eligible'
    }
}, {
    timestamps: true
});

// Compound index to ensure a student can't enroll in the same module twice in the same semester/year context
// unless logic explicitly handles it, but generally we want unique active enrollments logic handled in controller
moduleEnrollmentSchema.index({ student: 1, module: 1, academicYear: 1 }, { unique: true });
moduleEnrollmentSchema.index({ student: 1, isRepeat: 1 });

module.exports = mongoose.model('ModuleEnrollment', moduleEnrollmentSchema);
