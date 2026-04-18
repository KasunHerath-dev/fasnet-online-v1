const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fas_db');
        console.log('Connected to DB');

        const total = await User.countDocuments();
        const locked = await User.countDocuments({ isAccountLocked: true });
        
        // Count admins who are students
        const adminStudents = await User.countDocuments({ roles: 'admin', studentRef: { $ne: null } });
        const lockedAdminStudents = await User.countDocuments({ roles: 'admin', studentRef: { $ne: null }, isAccountLocked: true });

        // Count pure admins
        const pureAdmins = await User.countDocuments({ roles: 'admin', studentRef: null });
        const lockedPureAdmins = await User.countDocuments({ roles: 'admin', studentRef: null, isAccountLocked: true });

        console.log('--- LOCKDOWN STATUS REPORT ---');
        console.log(`Total Users: ${total}`);
        console.log(`Total Locked: ${locked}`);
        console.log(`Admin-Students Total: ${adminStudents}, Locked: ${lockedAdminStudents}`);
        console.log(`Pure-Admins Total: ${pureAdmins}, Locked: ${lockedPureAdmins}`);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
