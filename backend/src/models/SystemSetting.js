const mongoose = require('mongoose');

const SystemSettingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    description: {
        type: String
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

SystemSettingSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('SystemSetting', SystemSettingSchema);
