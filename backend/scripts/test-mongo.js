const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI;

async function testMongo() {
    console.log('Testing MongoDB Connection...');
    console.log('URI:', mongoUri ? (mongoUri.includes('@') ? mongoUri.split('@')[1] : 'Found but sensitive') : 'Missing');

    if (!mongoUri) {
        console.error('❌ Missing MONGO_URI in .env');
        return;
    }

    try {
        console.log('Attempting to connect (timeout set to 10s)...');
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000
        });
        console.log('✅ Successfully connected to MongoDB Atlas!');
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:');
        console.error(error.message);
        if (error.message.includes('timeout')) {
            console.error('\n💡 This is almost certainly a networking/whitelisting issue.');
            console.log('1. Go to cloud.mongodb.com');
            console.log('2. Network Access -> Add IP Address');
            console.log('3. Add "0.0.0.0/0" for testing or "Allow Access from Anywhere".');
        }
    }
}

testMongo();
