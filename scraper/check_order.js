import 'dotenv/config';
import mongoose from 'mongoose';
import Notice from './Notice.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const notices = await Notice.find({ status: 'published' })
            .sort({ publishedAt: -1, createdAt: -1 })
            .select('title publishedAt createdAt date')
            .limit(10);
            
        console.log('--- Published Notices Order ---');
        notices.forEach((n, i) => {
            console.log(`${i+1}. ${n.title}`);
            console.log(`   Published: ${n.publishedAt}`);
            console.log(`   Created:   ${n.createdAt}`);
            console.log(`   Display:   ${n.date}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
