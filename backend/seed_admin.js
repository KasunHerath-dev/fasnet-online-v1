const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    roles: { type: [String], default: ['admin'] },
});

const User = mongoose.model('User', userSchema);

async function seed() {
    try {
        console.log(`[seed] Connecting to: ${MONGO_URI}`);
        await mongoose.connect(MONGO_URI);
        
        const existing = await User.findOne({ username: 'admin' });
        if (existing) {
            console.log('[seed] Admin already exists');
        } else {
            const salt = await bcrypt.genSalt(12);
            const passwordHash = await bcrypt.hash('admin123', salt);
            
            await User.create({
                username: 'admin',
                passwordHash,
                roles: ['superadmin', 'admin']
            });
            console.log('[seed] Admin created: admin / admin123');
        }
        
        process.exit(0);
    } catch (err) {
        console.error('[seed] Error:', err.message);
        process.exit(1);
    }
}

seed();
