const BatchYear = require('../models/BatchYear');
const logger = require('../utils/logger');

const getAllBatchYears = async (req, res) => {
    try {
        const batchYears = await BatchYear.find().sort({ year: -1 });
        res.json({ batchYears });
    } catch (error) {
        logger.error('Get batch years error', { error: error.message });
        res.status(500).json({ error: { message: 'Failed to fetch batch years', code: 'FETCH_FAILED' } });
    }
};

const createBatchYear = async (req, res) => {
    try {
        const { year, name, startDate, endDate, relatedCourse, description } = req.body;

        if (!year) {
            return res.status(400).json({ error: { message: 'Year is required', code: 'VALIDATION_ERROR' } });
        }

        const existing = await BatchYear.findOne({ year });
        if (existing) {
            return res.status(400).json({ error: { message: 'Batch year already exists', code: 'DUPLICATE' } });
        }

        const batchYear = await BatchYear.create({
            year,
            name: name || `Batch ${year}`,
            startDate,
            endDate,
            relatedCourse,
            description,
        });

        res.status(201).json({ batchYear, message: 'Batch year created successfully' });
    } catch (error) {
        logger.error('Create batch year error', { error: error.message });
        res.status(500).json({ error: { message: 'Failed to create batch year', code: 'CREATE_FAILED' } });
    }
};

const updateBatchYear = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const batchYear = await BatchYear.findByIdAndUpdate(id, updates, { new: true });
        if (!batchYear) {
            return res.status(404).json({ error: { message: 'Batch year not found', code: 'NOT_FOUND' } });
        }

        res.json({ batchYear, message: 'Batch year updated' });
    } catch (error) {
        logger.error('Update batch year error', { error: error.message });
        res.status(500).json({ error: { message: 'Update failed', code: 'UPDATE_FAILED' } });
    }
};

const deleteBatchYear = async (req, res) => {
    try {
        const { id } = req.params;
        await BatchYear.findByIdAndDelete(id);
        res.json({ message: 'Batch year deleted' });
    } catch (error) {
        logger.error('Delete batch year error', { error: error.message });
        res.status(500).json({ error: { message: 'Delete failed', code: 'DELETE_FAILED' } });
    }
};

module.exports = {
    getAllBatchYears,
    createBatchYear,
    updateBatchYear,
    deleteBatchYear,
};
