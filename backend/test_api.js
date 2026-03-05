const axios = require('axios');
const FormData = require('form-data');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testUpload() {
    try {
        // 1. Get admin user and generate token
        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./src/models/User');
        const admin = await User.findOne({ roles: { $in: ['superadmin', 'admin'] } });
        if (!admin) { console.log("No admin found!"); process.exit(1); }

        const token = jwt.sign(
            { userId: admin._id, roles: admin.roles, studentRef: admin.studentRef, batchScope: admin.batchScope },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '30d' }
        );

        console.log("Admin found:", admin.username, "| Roles:", admin.roles);
        console.log("Token generated. Sending file upload...\n");

        await mongoose.disconnect();

        // 2. Upload CSV file
        const form = new FormData();
        form.append('batchYear', '2025');
        form.append('combination', 'COMB1');
        form.append('file', Buffer.from('Registration Number\n232174\n242004\n242009\n'), {
            filename: 'test.csv',
            contentType: 'text/csv',
        });

        const res = await axios.post('http://localhost:5000/api/v1/academic/bulk-combination', form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });

        console.log("✅ SUCCESS:");
        console.log(JSON.stringify(res.data, null, 2));

    } catch (err) {
        console.log("❌ CRASH CAUGHT!");
        if (err.response) {
            console.log("Status:", err.response.status);
            console.log("Body:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.log("Error:", err.message);
        }
    }
}
testUpload();
