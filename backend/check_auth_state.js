const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../secure_config/.env') });

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fas_db';
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const checkDocs = async () => {
    await connectDB();

    let output = '';
    const log = (msg) => { console.log(msg); output += msg + '\n'; };

    try {
        const SystemSetting = require('./src/models/SystemSetting');
        const token = await SystemSetting.findOne({ key: 'GOOGLE_REFRESH_TOKEN' });

        log('--- System Settings Check ---');
        if (token) {
            log('✅ GOOGLE_REFRESH_TOKEN found in DB');
            log('Token value: ' + (token.value ? 'Present' : 'Empty'));
        } else {
            log('❌ GOOGLE_REFRESH_TOKEN NOT found in DB');
        }

        log('--- Environment Check ---');
        log('GOOGLE_CLIENT_ID: ' + (process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing'));
        log('GOOGLE_REDIRECT_URI: ' + process.env.GOOGLE_REDIRECT_URI);

        fs.writeFileSync('auth_status.txt', output);

    } catch (error) {
        console.error('Error querying DB:', error);
        fs.writeFileSync('auth_status.txt', 'Error: ' + error.message);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

checkDocs();
