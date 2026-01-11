const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const { validatePassword } = require('../utils/validators');
const logger = require('../utils/logger');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

const register = async (req, res) => {
  try {
    const { username, password, roles, studentRef } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: { message: 'Username and password required', code: 'MISSING_FIELDS' } });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: {
          message: 'Password must be at least 6 chars, contain 1 uppercase and 1 number',
          code: 'WEAK_PASSWORD',
        },
      });
    }

    let existingUser;
    try {
      existingUser = await User.findOne({ username: username.toLowerCase() });
    } catch (dbErr) {
      logger.error('DB lookup error', { error: dbErr.message });
      return res.status(500).json({ error: { message: 'Database error', code: 'DB_ERROR', details: dbErr.message } });
    }

    if (existingUser) {
      return res.status(409).json({ error: { message: 'User already exists', code: 'USER_EXISTS' } });
    }

    const user = new User({
      username: username.toLowerCase(),
      passwordHash: password,
      roles: ['user'], // Force default role for public registration
      studentRef: studentRef || null,
    });

    await user.save();
    logger.info('User registered', { userId: user._id, username });

    const token = generateToken(user._id);
    return res.status(201).json({ message: 'User registered', token, user: user.toJSON() });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Register error', { error: errorMsg, stack: error.stack });
    return res.status(500).json({ error: { message: 'Registration failed', code: 'REGISTER_FAILED', details: errorMsg } });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: { message: 'Username and password required', code: 'MISSING_FIELDS' } });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      logger.warn(`Login failed: User not found for username: ${username.toLowerCase()}`);
      return res.status(401).json({ error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' } });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password for user: ${username}`);
      return res.status(401).json({ error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' } });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: { message: 'User is inactive', code: 'USER_INACTIVE' } });
    }

    const token = generateToken(user._id);

    // If password change is required, return early with minimal data
    // Do NOT update lastActiveAt (db save) and do NOT fetch extra data
    if (user.needsPasswordChange) {
      return res.json({
        message: 'Please change your password',
        token,
        user: {
          _id: user._id,
          username: user.username,
          roles: user.roles,
          needsPasswordChange: true,
          isActive: user.isActive
        }
      });
    }

    // Update lastActiveAt immediately
    user.lastActiveAt = new Date();
    await user.save();

    logger.info('User logged in', { userId: user._id, username });

    // Populate studentRef with deep population for repeatModules
    if (user.studentRef) {
      await user.populate({
        path: 'studentRef',
        populate: {
          path: 'repeatModules.module',
          select: 'code title credits'
        }
      });
    }

    res.json({ message: 'Login successful', token, user: user.toJSON() });
  } catch (error) {
    logger.error('Login error', { error: error.message });
    res.status(500).json({ error: { message: 'Login failed', code: 'LOGIN_FAILED', details: error.message } });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'studentRef',
      populate: {
        path: 'repeatModules.module',
        select: 'code title credits'
      }
    });
    res.json({ user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to get user', code: 'GET_USER_FAILED' } });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id; // From authMiddleware

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: { message: 'Current and new password required', code: 'MISSING_FIELDS' } });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        error: {
          message: 'New password must be at least 6 chars, contain 1 uppercase and 1 number',
          code: 'WEAK_PASSWORD',
        },
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found', code: 'USER_NOT_FOUND' } });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: { message: 'Invalid current password', code: 'INVALID_PASSWORD' } });
    }

    user.passwordHash = newPassword; // Will be hashed by pre-save hook
    user.needsPasswordChange = false; // clear the flag
    await user.save();

    logger.info('Password changed', { userId: user._id });
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error', { error: error.message });
    res.status(500).json({ error: { message: 'Failed to change password', code: 'CHANGE_PASSWORD_FAILED' } });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    const userId = req.user._id;

    if (!preferences) {
      return res.status(400).json({ error: { message: 'Preferences data required', code: 'MISSING_DATA' } });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found', code: 'USER_NOT_FOUND' } });
    }

    // Merge new preferences with existing ones
    user.preferences = { ...user.preferences.toObject(), ...preferences };
    await user.save();

    logger.info('User preferences updated', { userId: user._id });
    res.json({ message: 'Preferences updated', preferences: user.preferences });
  } catch (error) {
    logger.error('Update preferences error', { error: error.message });
    res.status(500).json({ error: { message: 'Failed to update preferences', code: 'UPDATE_FAILED' } });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  changePassword,
  updatePreferences,
};
