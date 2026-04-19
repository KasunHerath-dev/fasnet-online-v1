const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../../middleware/auth');
const ctrl = require('../../controllers/admin/lmsAdminController');

// All routes require authentication + superadmin role
router.use(authMiddleware);
router.use(roleMiddleware('superadmin'));

router.get('/stats',                                    ctrl.getStats);
router.get('/students',                                 ctrl.getStudents);
router.get('/students/unlinked',                        ctrl.getUnlinkedStudents);
router.get('/assignments',                              ctrl.getAssignments);
router.get('/service/health',                           ctrl.getServiceHealth);
router.post('/sync/all',                                ctrl.syncAll);
router.post('/sync/system-audit',                       ctrl.runSystemAudit);
router.post('/sync/:studentId',                         ctrl.syncStudent);
router.post('/invite',                                  ctrl.sendInvite);
router.delete('/students/:studentId/credentials',       ctrl.removeStudentCredentials);

module.exports = router;

