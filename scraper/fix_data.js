import 'dotenv/config';
import mongoose from 'mongoose';
import Notice from './Notice.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function fix() {
    try {
        await mongoose.connect(MONGODB_URI);
        
        // Find all notices where status is missing or null
        const result = await Notice.updateMany(
            { status: { $exists: false } },
            { $set: { status: 'draft' } }
        );
        
        console.log(`Updated ${result.modifiedCount} notices with missing status to "draft".`);
        
        // Also ensure AI processed flag is consistent
        const resultAI = await Notice.updateMany(
            { aiProcessed: { $exists: false } },
            { $set: { aiProcessed: false } }
        );
        console.log(`Updated ${resultAI.modifiedCount} notices with missing aiProcessed flag.`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
