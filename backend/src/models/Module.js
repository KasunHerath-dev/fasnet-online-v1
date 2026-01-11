const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    credits: {
        type: Number,
        required: true,
        min: 0
    },
    level: {
        type: Number,
        required: true,
        min: 1,
        max: 4
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 2
    },
    department: {
        type: String,
        required: true,
        enum: ['CMIS', 'ELTN', 'IMGT', 'MATH', 'STAT', 'MMOD', 'ELPC']
    },
    isCompulsory: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Module', moduleSchema);
