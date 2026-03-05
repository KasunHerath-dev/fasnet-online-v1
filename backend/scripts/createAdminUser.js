const mongoose = require('mongoose');
const User = require('../src/models/User');
const path = require('path');
const fs = require('fs');

// Load environment variables
const localEnvPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(localEnvPath)) {
    require('dotenv').config({ path: localEnvPath });
} else {
    require('dotenv').config({ path: path.resolve(__dirname, '../../secure_config/.env') });
}

const createAdmin = async () => {
    // Get args from command line: node createAdminUser.js <username> <password>
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log('Usage: node createAdminUser.js <username> <password>');
        process.exit(1);
    }

    const [username, password] = args;

    try {
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI is undefined. Check your .env file.');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if user exists
        let user = await User.findOne({ username: username });

        if (user) {
            console.log(`⚠️  User ${username} already exists. Updating roles...`);
            user.roles = ['superadmin'];
            // Update permissions if needed, or keep existing
            if (!user.permissions || user.permissions.length === 0) {
                user.permissions = [
                    'view_students', 'add_students', 'edit_students', 'delete_students',
                    'view_birthdays', 'view_analytics', 'manage_users', 'system_settings',
                    'bulk_import', 'bulk_update', 'manage_resources', 'manage_assessments'
                ];
            }
            // Update password if provided
            if (password) {
                user.passwordHash = password;
                // Schema pre-save hook will hash this
            }
        } else {
            console.log(`Creating new admin user '${username}'...`);
            user = new User({
                username,
                passwordHash: password,
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
                    'bulk_update',
                    'manage_resources',
                    'manage_assessments'
                ],
                isActive: true
            });
        }

        await user.save();
        console.log(`🎉 Admin user ${username} created/updated successfully!`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating admin:', err);
        process.exit(1);
    }
};

createAdmin();
