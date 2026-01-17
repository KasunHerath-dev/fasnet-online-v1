const User = require('../models/User')
const logger = require('../utils/logger')

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
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

    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({ error: { message: 'Username already exists' } })
    }

    const newUser = new User({ username, password, roles, isActive: true })
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
      const existingUser = await User.findOne({ username })
      if (existingUser) {
        return res.status(400).json({ error: { message: 'Username already taken' } })
      }
      user.username = username
    }

    if (password) {
      user.password = password
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

    // Find users active in last 5 minutes
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

// Promote user to admin with specific permissions
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

    const user = await User.findByIdAndUpdate(id, updateOps, {
      new: true,
      runValidators: true
    })

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } })
    }

    logger.info(`User ${user.username} promoted to admin${user.batchScope ? ` (Batch ${user.batchScope})` : ''}`)
    res.json({
      message: 'User promoted successfully',
      user: {
        _id: user._id,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions,
        batchScope: user.batchScope
      }
    })
  } catch (error) {
    logger.error('Promote user error:', error)
    res.status(500).json({ error: { message: 'Failed to promote user' } })
  }
}

// Demote user (remove admin role and permissions)
exports.demoteUser = async (req, res) => {
  try {
    const { id } = req.params

    // Reset to basic 'user' role, clear permissions and batchScope
    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          roles: ['user'],
          permissions: [],
          batchScope: null
        }
      },
      { new: true, runValidators: true }
    )

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } })
    }

    logger.info(`User ${user.username} demoted to regular user`)
    res.json({
      message: 'User demoted successfully',
      user: {
        _id: user._id,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions
      }
    })
  } catch (error) {
    logger.error('Demote user error:', error)
    res.status(500).json({ error: { message: 'Failed to demote user' } })
  }
}

// Update user permissions
exports.updatePermissions = async (req, res) => {
  try {
    const { id } = req.params
    const { permissions, batchScope } = req.body

    const updateOps = {
      $set: { permissions: permissions || [] }
    }

    if (batchScope !== undefined) {
      updateOps.$set.batchScope = batchScope ? parseInt(batchScope) : null
    }

    const user = await User.findByIdAndUpdate(id, updateOps, {
      new: true,
      runValidators: true
    })

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } })
    }

    logger.info(`Permissions updated for user ${user.username}${user.batchScope ? ` (Batch ${user.batchScope})` : ''}`)
    res.json({
      message: 'Permissions updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions,
        batchScope: user.batchScope
      }
    })
  } catch (error) {
    logger.error('Update permissions error:', error)
    res.status(500).json({ error: { message: 'Failed to update permissions' } })
  }
}

// Link a student profile to a user account (for dual role)
exports.linkStudentToUser = async (req, res) => {
  try {
    const { id } = req.params
    const { studentId } = req.body

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } })
    }

    // Verify student exists
    const Student = require('../models/Student')
    const student = await Student.findById(studentId)
    if (!student) {
      return res.status(404).json({ error: { message: 'Student not found' } })
    }

    // Link student to user
    user.studentRef = studentId
    await user.save()

    logger.info(`Linked student ${student.registrationNumber} to user ${user.username}`)
    res.json({
      message: 'Student linked successfully',
      user: {
        _id: user._id,
        username: user.username,
        roles: user.roles,
        studentRef: user.studentRef
      }
    })
  } catch (error) {
    logger.error('Link student error:', error)
    res.status(500).json({ error: { message: 'Failed to link student' } })
  }
}

// Lock all non-admin users
exports.lockAllUsers = async (req, res) => {
  try {
    const result = await User.updateMany(
      { roles: { $nin: ['admin', 'superadmin'] } },
      { $set: { isActive: false } }
    )

    logger.info(`Bulk locked ${result.modifiedCount} users`)
    res.json({
      message: `Successfully locked ${result.modifiedCount} users`,
      count: result.modifiedCount
    })
  } catch (error) {
    logger.error('Lock all users error:', error)
    res.status(500).json({ error: { message: 'Failed to lock users' } })
  }
}

// Unlock all users
exports.unlockAllUsers = async (req, res) => {
  try {
    const result = await User.updateMany(
      {},
      { $set: { isActive: true } }
    )

    logger.info(`Bulk unlocked ${result.modifiedCount} users`)
    res.json({
      message: `Successfully unlocked ${result.modifiedCount} users`,
      count: result.modifiedCount
    })
  } catch (error) {
    logger.error('Unlock all users error:', error)
    res.status(500).json({ error: { message: 'Failed to unlock users' } })
  }
}
