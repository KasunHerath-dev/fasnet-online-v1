const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const Student = require('./src/models/Student');
        const students = await Student.find({
            registrationNumber: { $regex: /^(2421|2420|2325)/i }
        }).limit(10);
        console.log("Students with combination:", students.map(s => ({
            reg: s.registrationNumber,
            combo: s.combination,
            locked: s.isCombinationLocked,
            batch: s.batchYear
        })));
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
