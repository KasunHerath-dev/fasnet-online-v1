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

const verifyLogin = async () => {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log('Usage: node verifyLogin.js <username> <password>');
        process.exit(1);
    }
    const [username, password] = args;

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to DB');

        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            console.log('❌ User not found');
        } else {
            console.log('✅ User found:', user.username);
            console.log('   Roles:', user.roles);
            console.log('   Active:', user.isActive);
            console.log('   Stored Hash:', user.passwordHash);

            const isMatch = await user.comparePassword(password);
            if (isMatch) {
                console.log('✅ Password Match: SUCCESS');
            } else {
                console.log('❌ Password Match: FAILED');
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyLogin();
