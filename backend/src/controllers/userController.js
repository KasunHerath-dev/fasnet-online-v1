const User = require('../models/User')
const logger = require('../utils/logger')

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 })
    res.json({ users })
  } catch (error) {
    logger.error('Get all users error:', error)
    res.status(500).json({ error: { message: 'Failed to fetch users' } })
  }
}

exports.createUser = async (req, res) => {
  try {
    const { username, password, roles } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: { message: 'Username and password are required' } })
    }

    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ error: { message: 'At least one role must be specified' } })
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ error: { message: 'Username already exists' } })
    }

    const newUser = new User({ 
      username: username.toLowerCase(), 
      passwordHash: password, 
      roles, 
      isActive: true 
    })
    await newUser.save()

    res.status(201).json({ user: { _id: newUser._id, username: newUser.username, roles: newUser.roles } })
  } catch (error) {
    logger.error('Create user error:', error)
    res.status(500).json({ error: { message: 'Failed to create user' } })
  }
}

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { username, password, roles, isActive } = req.body

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } })
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username: username.toLowerCase() })
      if (existingUser) {
        return res.status(400).json({ error: { message: 'Username already taken' } })
      }
      user.username = username.toLowerCase()
    }

    if (password) {
      user.passwordHash = password
    }

    if (Array.isArray(roles)) {
      user.roles = roles
    }

    if (typeof isActive === 'boolean') {
      user.isActive = isActive
    }

    await user.save()

    res.json({ user: { _id: user._id, username: user.username, roles: user.roles, isActive: user.isActive } })
  } catch (error) {
    logger.error('Update user error:', error)
    res.status(500).json({ error: { message: 'Failed to update user' } })
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } })
    }
    await User.findByIdAndDelete(id)
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    logger.error('Delete user error:', error)
    res.status(500).json({ error: { message: 'Failed to delete user' } })
  }
}

exports.getOnlineUsers = async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const onlineUsers = await User.find({
      lastActiveAt: { $gte: fiveMinutesAgo }
    })
      .select('username roles lastActiveAt studentRef')
      .sort({ lastActiveAt: -1 })

    res.json({
      count: onlineUsers.length,
      users: onlineUsers
    })
  } catch (error) {
    logger.error('Get online users error:', error)
    res.status(500).json({ error: { message: 'Failed to fetch online users' } })
  }
}

exports.promoteUser = async (req, res) => {
  try {
    const { id } = req.params
    const { permissions, batchScope } = req.body
    const updateOps = {
      $addToSet: { roles: 'admin' },
      $set: { permissions: permissions || [] }
    }
    if (batchScope !== undefined) {
      updateOps.$set.batchScope = batchScope ? parseInt(batchScope) : null
    }
    const user = await User.findByIdAndUpdate(id, updateOps, { new: true, runValidators: true })
    if (!user) return res.status(404).json({ error: { message: 'User not found' } })
    res.json({ message: 'User promoted successfully', user })
  } catch (error) {
    logger.error('Promote user error:', error)
    res.status(500).json({ error: { message: 'Failed to promote user' } })
  }
}

exports.demoteUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findByIdAndUpdate(id, { $set: { roles: ['user'], permissions: [], batchScope: null } }, { new: true })
    if (!user) return res.status(404).json({ error: { message: 'User not found' } })
    res.json({ message: 'User demoted successfully', user })
  } catch (error) {
    logger.error('Demote user error:', error)
    res.status(500).json({ error: { message: 'Failed to demote user' } })
  }
}

exports.updatePermissions = async (req, res) => {
  try {
    const { id } = req.params
    const { permissions, batchScope } = req.body
    const updateOps = { $set: { permissions: permissions || [] } }
    if (batchScope !== undefined) updateOps.$set.batchScope = batchScope ? parseInt(batchScope) : null
    const user = await User.findByIdAndUpdate(id, updateOps, { new: true })
    if (!user) return res.status(404).json({ error: { message: 'User not found' } })
    res.json({ message: 'Permissions updated successfully', user })
  } catch (error) {
    logger.error('Update permissions error:', error)
    res.status(500).json({ error: { message: 'Failed to update permissions' } })
  }
}

exports.linkStudentToUser = async (req, res) => {
  try {
    const { id } = req.params
    const { studentId } = req.body
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: { message: 'User not found' } })
    const Student = require('../models/Student')
    const student = await Student.findById(studentId)
    if (!student) return res.status(404).json({ error: { message: 'Student not found' } })
    user.studentRef = studentId
    await user.save()
    res.json({ message: 'Student linked successfully', user })
  } catch (error) {
    logger.error('Link student error:', error)
    res.status(500).json({ error: { message: 'Failed to link student' } })
  }
}

exports.lockAllUsers = async (req, res) => {
  try {
    const resetMarker = 'AC_RESET_' + Date.now();
    // Aggressively target EVERYONE except the system superadmin
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
    )
    logger.info(`🚨 MASS RESET: Multi-factor lock applied to ${result.modifiedCount} accounts`)
    res.json({
      message: `Successfully reset and locked ${result.modifiedCount} accounts. Re-verification required.`,
      count: result.modifiedCount
    })
  } catch (error) {
    logger.error('Mass account reset error:', error)
    res.status(500).json({ error: { message: 'Failed to perform mass account reset' } })
  }
}

exports.unlockAllUsers = async (req, res) => {
  try {
    const result = await User.updateMany({}, { $set: { isActive: true, isAccountLocked: false } })
    res.json({ message: `Successfully unlocked ${result.modifiedCount} users`, count: result.modifiedCount })
  } catch (error) {
    logger.error('Unlock all users error:', error)
    res.status(500).json({ error: { message: 'Failed to unlock users' } })
  }
}

exports.setupProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body
    if (!firstName || !lastName) {
      return res.status(400).json({ error: { message: 'First name and last name are required' } })
    }

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: { message: 'User not found' } })

    user.firstName = firstName
    user.lastName = lastName
    user.needsProfileSetup = false
    await user.save()

    // Sync with student record if linked
    if (user.studentRef) {
      const Student = require('../models/Student')
      await Student.findByIdAndUpdate(user.studentRef, {
        $set: { firstName, lastName }
      })
    }

    res.json({ message: 'Profile updated successfully', user })
  } catch (error) {
    logger.error('Setup profile error:', error)
    res.status(500).json({ error: { message: 'Failed to update profile' } })
  }
}
