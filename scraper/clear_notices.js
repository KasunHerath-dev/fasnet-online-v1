import 'dotenv/config';
import mongoose from 'mongoose';
import Notice from './Notice.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function clear() {
    try {
        await mongoose.connect(MONGODB_URI);
        const result = await Notice.deleteMany({});
        console.log(`Deleted ${result.deletedCount} notices from ${MONGODB_URI.split('@')[1] || MONGODB_URI}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

clear();
