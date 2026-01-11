const express = require('express');
const router = express.Router();
const batchYearController = require('../controllers/batchYearController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, batchYearController.getAllBatchYears);
router.post('/', authMiddleware, roleMiddleware('superadmin'), batchYearController.createBatchYear);
router.put('/:id', authMiddleware, roleMiddleware('superadmin'), batchYearController.updateBatchYear);
router.delete('/:id', authMiddleware, roleMiddleware('superadmin'), batchYearController.deleteBatchYear);

module.exports = router;
