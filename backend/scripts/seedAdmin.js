require('dotenv').config({ path: require('path').resolve(__dirname, '../../secure_config/.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');

const seedAdmin = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is undefined. Check your .env file or environment variables.');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const adminExists = await User.findOne({
            $or: [{ roles: 'superadmin' }, { username: 'admin' }]
        });

        if (adminExists) {
            console.log('⚠️  Admin user already exists. Skipping creation.');
            process.exit(0);
        }

        const admin = new User({
            username: 'admin',
            passwordHash: 'Fas@2024!', // Default strong password
            roles: ['superadmin'],
            permissions: [
                'view_students',
                'add_students',
                'edit_students',
                'delete_students',
                'view_birthdays',
                'view_analytics',
                'manage_users',
                'system_settings',
                'bulk_import',
                'bulk_update'
            ],
            isActive: true
        });

        await admin.save();
        console.log('🎉 Superadmin created successfully!');
        console.log('👤 Username: admin');
        console.log('🔑 Password: Fas@2024!');
        console.log('⚠️  Change this password immediately after logging in!');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding admin:', err);
        process.exit(1);
    }
};

seedAdmin();
