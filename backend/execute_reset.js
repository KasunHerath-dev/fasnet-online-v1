const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

async function performReset() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fas_db');
        console.log('Connected to DB');

        const resetMarker = 'AC_RESET_' + Date.now();
        
        // LOCK EVERYONE EXCEPT SUPERADMIN
        const result = await User.updateMany(
            { roles: { $ne: 'superadmin' } },
            { 
                $set: { 
                    isAccountLocked: true, 
                    isActive: true, 
                    passwordHash: resetMarker, 
                    otp: null,
                    otpExpiresAt: null,
                    needsProfileSetup: true
                } 
            }
        );

        console.log(`--- RESET COMPLETE ---`);
        console.log(`Accounts Targeted & Locked: ${result.modifiedCount}`);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

performReset();
