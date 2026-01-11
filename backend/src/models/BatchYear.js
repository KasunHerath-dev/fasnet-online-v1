const mongoose = require('mongoose');

const batchYearSchema = new mongoose.Schema({
    year: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,  // e.g., "Batch 2024", "24/25 Intake"
    },
    startDate: Date,
    endDate: Date,
    isActive: {
        type: Boolean,
        default: true,
    },
    relatedCourse: {
        type: String,  // Optional: link to a course
    },
    description: String,
}, {
    timestamps: true,
});

module.exports = mongoose.model('BatchYear', batchYearSchema);
