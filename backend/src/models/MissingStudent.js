const mongoose = require('mongoose');

const missingStudentSchema = new mongoose.Schema({
    registrationNumber: {
        type: String,
        required: true,
    },
    fullName: String,
    nicNumber: String,
    gender: String,
    birthday: Date,
    whatsapp: String,
    email: String,
    address: String,
    guardianName: String,
    guardianRelationship: String,
    guardianPhone: String,
    district: String,
    nearestCity: String,
    homeTown: String,
    batchYear: String,
    course: String,
    importedAt: {
        type: Date,
        default: Date.now,
    },
    importFile: String,
    notes: String,
}, {
    timestamps: true,
});

module.exports = mongoose.model('MissingStudent', missingStudentSchema);
