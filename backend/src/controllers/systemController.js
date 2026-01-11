const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const logger = require('../utils/logger');

exports.getSystemStats = async (req, res) => {
    try {
        // 1. Total Users
        const usersCount = await User.countDocuments();

        // 2. Database Size
        let dbSize = 0;
        let dbSizeFormatted = '0 MB';
        if (mongoose.connection.db) {
            const stats = await mongoose.connection.db.stats();
            dbSize = stats.dataSize + stats.indexSize;
            dbSizeFormatted = (dbSize / (1024 * 1024)).toFixed(2) + ' MB';
        }

        // 3. Uptime
        const uptimeSeconds = process.uptime();
        const days = Math.floor(uptimeSeconds / (3600 * 24));
        const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);

        let uptimeString = '';
        if (days > 0) uptimeString += `${days}d `;
        if (hours > 0) uptimeString += `${hours}h `;
        uptimeString += `${minutes}m`;

        // 4. System Status
        const systemStatus = 'Healthy';

        // 5. Student Statistics
        const totalStudents = await Student.countDocuments();
        const maleStudents = await Student.countDocuments({ gender: 'Male' });
        const femaleStudents = await Student.countDocuments({ gender: 'Female' });

        // 6. Upcoming Birthdays (next 30 days)
        const today = new Date();
        const endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

        const students = await Student.find({ birthday: { $exists: true, $ne: null } });
        const upcomingBirthdays = students
            .map(s => ({ ...s.toObject(), nextBirthday: s.nextBirthday }))
            .filter(s => s.nextBirthday >= today && s.nextBirthday <= endDate);

        res.json({
            usersCount,
            dbSize: dbSizeFormatted,
            uptime: uptimeString,
            status: systemStatus,
            students: {
                total: totalStudents,
                male: maleStudents,
                female: femaleStudents,
                birthdays: upcomingBirthdays.length
            }
        });

    } catch (error) {
        logger.error('Get system stats error:', error);
        res.status(500).json({ error: { message: 'Failed to fetch system stats' } });
    }
};
