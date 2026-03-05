const mongoose = require('mongoose');
require('dotenv').config();

async function prepareTest() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./src/models/User');
        const Student = require('./src/models/Student');

        // 1. Find a student with an email
        const student = await Student.findOne({ email: { $exists: true, $ne: '' } });
        if (!student) {
            console.log('No student with email found for testing.');
            process.exit(1);
        }

        console.log(`Found test student: ${student.registrationNumber} (${student.email})`);

        // 2. Find or create user
        let user = await User.findOne({ studentRef: student._id });
        if (!user) {
            console.log('Creating test user...');
            user = new User({
                username: student.registrationNumber.toLowerCase(),
                passwordHash: 'temporary',
                roles: ['user'],
                studentRef: student._id
            });
        }

        // 3. Lock the account
        user.isAccountLocked = true;
        user.otp = null;
        user.otpExpiresAt = null;
        await user.save();

        console.log(`User ${user.username} is now LOCKED and ready for OTP testing.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

prepareTest();
