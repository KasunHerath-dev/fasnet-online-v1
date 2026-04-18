import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
    key: { type: String, unique: true, required: true },
    value: mongoose.Schema.Types.Mixed,
    description: String
}, { 
    timestamps: true 
});

export default mongoose.models.SystemSetting || mongoose.model('SystemSetting', settingSchema);
