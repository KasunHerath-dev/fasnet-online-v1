const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Adjust path as needed
require('dotenv').config();

const seedAdmin = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const adminExists = await User.findOne({ role: 'super-admin' });

        if (adminExists) {
            console.log('⚠️  Super Admin already exists');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('Fas@2024!', 10);

        await User.create({
            username: 'admin',
            email: 'admin@fasnet.com',
            password: hashedPassword,
            role: 'super-admin',
            firstName: 'Super',
            lastName: 'Admin',
            isActive: true
        });

        console.log('🎉 Super Admin created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

seedAdmin();
