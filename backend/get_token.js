const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const User = require('./src/models/User');
        const admin = await User.findOne({ roles: { $in: ['superadmin', 'admin'] } });
        if (!admin) {
            console.log("No admin found!");
            process.exit(1);
        }

        // Generate token the same way authController does
        const token = jwt.sign(
            { id: admin._id, roles: admin.roles, studentRef: admin.studentRef },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '30d' }
        );

        console.log(token);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
