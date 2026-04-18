const express = require('express')
const { getAllUsers, createUser, updateUser, deleteUser, getOnlineUsers, promoteUser, demoteUser, updatePermissions, linkStudentToUser, lockAllUsers, unlockAllUsers, setupProfile } = require('../controllers/userController')
const { authMiddleware, roleMiddleware } = require('../middleware/auth')

const router = express.Router()

// Authenticated routes (all users)
router.use(authMiddleware)
router.put('/setup-profile', setupProfile)

// Admin-only routes
router.use(roleMiddleware('admin', 'superadmin'))

router.get('/online', getOnlineUsers)
router.get('/', getAllUsers)
router.post('/', createUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)
router.post('/:id/promote', promoteUser)
router.post('/:id/demote', demoteUser)
router.put('/:id/permissions', updatePermissions)
router.post('/:id/link-student', linkStudentToUser)
router.post('/lock-all', lockAllUsers)
router.post('/unlock-all', unlockAllUsers)


module.exports = router
