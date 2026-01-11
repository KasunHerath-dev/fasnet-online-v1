const mongoose = require('mongoose');
const User = require('../src/models/User'); // Adjust path as needed
require('dotenv').config();

const seedAdmin = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if superadmin exists. query 'roles' array for 'superadmin'
        const adminExists = await User.findOne({ roles: 'superadmin' });

        if (adminExists) {
            console.log('⚠️  Super Admin already exists');
            process.exit(0);
        }

        console.log('Creating Super Admin...');

        // Create new super admin
        // Note: User model pre-save hook will hash the passwordHash
        await User.create({
            username: 'admin',
            email: 'admin@fasnet.com',
            passwordHash: 'Fas@2024!', // Plain text, will be hashed by model
            roles: ['superadmin'],
            firstName: 'Super',
            lastName: 'Admin',
            isActive: true,
            needsPasswordChange: true
        });

        console.log('🎉 Super Admin created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedAdmin();
