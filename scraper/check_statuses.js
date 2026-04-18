import 'dotenv/config';
import mongoose from 'mongoose';
import Notice from './Notice.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const allCount = await Notice.countDocuments();
        const draftCount = await Notice.countDocuments({ status: 'draft' });
        const publishedCount = await Notice.countDocuments({ status: 'published' });
        const missingStatusCount = await Notice.countDocuments({ status: { $exists: false } });

        console.log('--- Notice Status Counts ---');
        console.log('Total:', allCount);
        console.log('Draft:', draftCount);
        console.log('Published:', publishedCount);
        console.log('Missing status field:', missingStatusCount);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
