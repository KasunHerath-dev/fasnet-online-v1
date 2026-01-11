const mongoose = require('mongoose');

const semesterResultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    gpa: {
        type: Number,
        default: 0.0
    },
    totalCredits: {
        type: Number,
        default: 0
    },
    earnedCredits: {
        type: Number, // Credits for Passed modules
        default: 0
    },
    status: {
        type: String,
        enum: ['Pass', 'Fail', 'Incomplete', 'Withheld'],
        default: 'Incomplete'
    },
    moduleResults: [{
        moduleEnrollment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ModuleEnrollment'
        },
        moduleCode: String,
        grade: String,
        credits: Number,
        isRepeat: Boolean
    }],
    probationStatus: {
        type: Boolean,
        default: false // True if GPA < 2.0
    }
}, {
    timestamps: true
});

semesterResultSchema.index({ student: 1, level: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('SemesterResult', semesterResultSchema);
