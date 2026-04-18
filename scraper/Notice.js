import mongoose from 'mongoose';

// No separate attachment schema needed as it's defined inline in the noticeSchema below.

const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    originalTitle: { type: String, trim: true },
    content: { type: String, trim: true },
    subtext: { type: String, trim: true },
    type: { 
        type: String, 
        enum: ['important', 'success', 'info', 'default'], 
        default: 'default' 
    },
    date: { type: String, required: true },
    sourceUrl: { type: String, trim: true },
    hash: { type: String, unique: true, sparse: true },
    attachments: [{
        filename: String,
        url: String,
        localPath: String,
        mimeType: String,
        sizeBytes: Number
    }],
    status: { type: String, enum: ['published', 'draft'], default: 'draft' },
    tags: [String],
    isActive: { type: Boolean, default: false },
    publishedAt: Date,
    aiProcessed: { type: Boolean, default: false }
}, { 
    timestamps: true 
});

export default mongoose.models.Notice || mongoose.model('Notice', noticeSchema);
