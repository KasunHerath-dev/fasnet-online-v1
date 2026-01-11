const mongoose = require('mongoose');

const academicProgressionHistorySchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    fromLevel: Number,
    fromSemester: Number,
    toLevel: Number,
    toSemester: Number,
    academicYear: String,
    progressionDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Promoted', 'Probationary Promotion', 'Retained'], // "Promoted" even with failed modules as per requirement
        default: 'Promoted'
    },
    remarks: String,
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AcademicProgressionHistory', academicProgressionHistorySchema);
