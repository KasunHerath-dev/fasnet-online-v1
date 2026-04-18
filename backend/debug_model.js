const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const SystemSettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    description: { type: String },
    updatedAt: { type: Date, default: Date.now }
});

const SystemSetting = mongoose.model('SystemSetting_Test', SystemSettingSchema);

async function test() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fas_db');
        console.log('Connected.');

        console.log('Creating setting...');
        const setting = await SystemSetting.create({
            key: 'TEST_KEY_' + Date.now(),
            value: 'test_value',
            description: 'Test description'
        });
        console.log('Created:', setting);

        process.exit(0);
    } catch (err) {
        console.error('FAILED:', err);
        process.exit(1);
    }
}

test();
