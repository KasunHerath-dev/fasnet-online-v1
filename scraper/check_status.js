import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../scraper/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fasnet';

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const Notice = mongoose.model('Notice', new mongoose.Schema({}, { strict: false }));
        const notice = await Notice.findOne({ 'attachments.0': { $exists: true } }).sort({ createdAt: -1 });
        if (notice) {
            console.log('--- Latest Notice with Attachments ---');
            console.log('Title:', notice.title);
            console.log('Attachments:', JSON.stringify(notice.attachments, null, 2));
        } else {
            console.log('No notices with attachments found.');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.connection.close();
    }
}

check();
