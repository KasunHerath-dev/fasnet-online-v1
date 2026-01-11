const MissingStudent = require('../models/MissingStudent');
const logger = require('../utils/logger');

const getAllMissingStudents = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const [students, total] = await Promise.all([
            MissingStudent.find().sort({ importedAt: -1 }).skip(skip).limit(Number(limit)),
            MissingStudent.countDocuments(),
        ]);

        res.json({
            students,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        logger.error('Get missing students error', { error: error.message });
        res.status(500).json({ error: { message: 'Failed to fetch missing students', code: 'FETCH_FAILED' } });
    }
};

const deleteMissingStudent = async (req, res) => {
    try {
        const { id } = req.params;
        await MissingStudent.findByIdAndDelete(id);
        res.json({ message: 'Missing student deleted' });
    } catch (error) {
        logger.error('Delete missing student error', { error: error.message });
        res.status(500).json({ error: { message: 'Delete failed', code: 'DELETE_FAILED' } });
    }
};

const deleteAllMissingStudents = async (req, res) => {
    try {
        await MissingStudent.deleteMany({});
        res.json({ message: 'All missing students deleted' });
    } catch (error) {
        logger.error('Delete all missing students error', { error: error.message });
        res.status(500).json({ error: { message: 'Delete all failed', code: 'DELETE_ALL_FAILED' } });
    }
};

const moveToMainDatabase = async (req, res) => {
    try {
        const { id } = req.params;
        const Student = require('../models/Student');

        const missing = await MissingStudent.findById(id);
        if (!missing) {
            return res.status(404).json({ error: { message: 'Missing student not found', code: 'NOT_FOUND' } });
        }

        // Create in main database
        await Student.create({
            registrationNumber: missing.registrationNumber,
            fullName: missing.fullName,
            nicNumber: missing.nicNumber,
            gender: missing.gender,
            birthday: missing.birthday,
            whatsapp: missing.whatsapp,
            email: missing.email,
            address: missing.address,
            guardianName: missing.guardianName,
            guardianRelationship: missing.guardianRelationship,
            guardianPhone: missing.guardianPhone,
            district: missing.district,
            nearestCity: missing.nearestCity,
            homeTown: missing.homeTown,
            batchYear: missing.batchYear,
            course: missing.course,
        });

        // Delete from missing
        await MissingStudent.findByIdAndDelete(id);

        res.json({ message: 'Student moved to main database' });
    } catch (error) {
        logger.error('Move to main database error', { error: error.message });
        res.status(500).json({ error: { message: 'Move failed', code: 'MOVE_FAILED' } });
    }
};

module.exports = {
    getAllMissingStudents,
    deleteMissingStudent,
    deleteAllMissingStudents,
    moveToMainDatabase,
};
