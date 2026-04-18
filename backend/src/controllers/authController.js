const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const { validatePassword } = require('../utils/validators');
const logger = require('../utils/logger');
const { createNotification } = require('./notificationController');
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/emailService');
const bcrypt = require('bcryptjs');

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
    logger.info(`Login approach: ${username}`);

    if (!username || !password) {
      return res.status(400).json({ error: { message: 'Username and password required', code: 'MISSING_FIELDS' } });
    }

    logger.info('DB Lookup Start');
    const user = await User.findOne({ username: username.toLowerCase() });
    logger.info('DB Lookup Finish', { found: !!user });

    if (!user) {
      logger.warn(`Login failed: User not found: ${username.toLowerCase()}`);
      return res.status(401).json({ error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' } });
    }

    if (user.isAccountLocked) {
      return res.status(403).json({ error: { message: 'Account is not activated.', code: 'ACCOUNT_LOCKED' } });
    }

    logger.info('Password Validation Start');
    const isPasswordValid = await user.comparePassword(password);
    logger.info('Password Validation Finish', { valid: isPasswordValid });

    if (!isPasswordValid) {
      return res.status(401).json({ error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' } });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: { message: 'User is inactive', code: 'USER_INACTIVE' } });
    }

    const token = generateToken(user._id);

    if (user.needsPasswordChange) {
      return res.json({
        message: 'Please change your password',
        token,
        user: { _id: user._id, username: user.username, roles: user.roles, needsPasswordChange: true }
      });
    }

    logger.info('User Save Start');
    user.lastActiveAt = new Date();
    await user.save();
    logger.info('User Save Finish');

    if (user.studentRef) {
      logger.info('Population Start');
      await user.populate({
        path: 'studentRef',
        populate: { path: 'repeatModules.module', select: 'code title credits' }
      });
      logger.info('Population Finish');
    }

    const userJson = user.toJSON();
    const needsProfileSetup = user.needsProfileSetup || (user.studentRef && (!user.studentRef.firstName || !user.studentRef.lastName));

    res.json({ message: 'Login successful', token, user: { ...userJson, needsProfileSetup } });
  } catch (error) {
    logger.error('Login error CRITICAL', { 
      message: error.message, 
      stack: error.stack,
      name: error.name
    });
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
    const userJson = user.toJSON();
    const needsProfileSetup = user.needsProfileSetup || (user.studentRef && (!user.studentRef.firstName || !user.studentRef.lastName));

    res.json({
      user: {
        ...userJson,
        needsProfileSetup
      }
    });
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

    // Fire notification (non-blocking — don't await so it doesn't affect response)
    createNotification({
      recipient: user._id,
      type: 'password_changed',
      title: 'Password Changed',
      body: 'Your account password was successfully updated. If you did not do this, please contact support immediately.',
      link: '/profile',
    }).catch(() => { }); // Silently ignore notification errors

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

const requestOTP = async (req, res) => {
  try {
    const { registrationNumber } = req.body;
    if (!registrationNumber) {
      return res.status(400).json({ error: { message: 'Registration number required', code: 'MISSING_FIELDS' } });
    }

    const regNum = registrationNumber.toLowerCase();
    const user = await User.findOne({ username: regNum }).populate('studentRef');

    if (!user) {
      return res.status(404).json({ error: { message: 'Student account not found', code: 'USER_NOT_FOUND' } });
    }

    if (!user.isAccountLocked) {
      return res.status(400).json({ error: { message: 'Account is already activated. Please login.', code: 'ALREADY_ACTIVE' } });
    }

    if (!user.studentRef || !user.studentRef.email) {
      return res.status(400).json({ error: { message: 'No email address associated with your student profile. Please contact administration.', code: 'NO_EMAIL' } });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiry to 15 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Hash OTP before storing
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    user.otp = hashedOtp;
    user.otpExpiresAt = expiresAt;
    await user.save();

    // Send email
    await sendOTPEmail(user.studentRef.email, otp, user.studentRef.firstName || user.studentRef.fullName);

    // Return safe data (mask the email)
    const email = user.studentRef.email;
    const maskedEmail = email.replace(/(.{2})(.*)(?=@)/, (match, prefix, middle) => prefix + '*'.repeat(middle.length));

    res.json({ message: `Activation code sent to ${maskedEmail}`, email: maskedEmail });
  } catch (error) {
    logger.error('Request OTP error', { error: error.message });
    res.status(500).json({ error: { message: 'Failed to request OTP', code: 'OTP_REQUEST_FAILED' } });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { registrationNumber, otp } = req.body;
    if (!registrationNumber || !otp) {
      return res.status(400).json({ error: { message: 'Registration number and OTP required', code: 'MISSING_FIELDS' } });
    }

    const user = await User.findOne({ username: registrationNumber.toLowerCase() });

    if (!user) return res.status(404).json({ error: { message: 'Student account not found', code: 'USER_NOT_FOUND' } });
    if (!user.isAccountLocked) return res.status(400).json({ error: { message: 'Account is already activated', code: 'ALREADY_ACTIVE' } });

    if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: { message: 'OTP is expired or invalid. Please request a new one.', code: 'OTP_EXPIRED' } });
    }

    const isValid = await bcrypt.compare(otp.toString(), user.otp);
    if (!isValid) {
      return res.status(400).json({ error: { message: 'Invalid activation code', code: 'INVALID_OTP' } });
    }

    res.json({ message: 'OTP verified successfully. Please set a new password.' });
  } catch (error) {
    logger.error('Verify OTP error', { error: error.message });
    res.status(500).json({ error: { message: 'Failed to verify OTP', code: 'OTP_VERIFY_FAILED' } });
  }
};

const setupPassword = async (req, res) => {
  try {
    const { registrationNumber, otp, newPassword } = req.body;

    if (!registrationNumber || !otp || !newPassword) {
      return res.status(400).json({ error: { message: 'All fields are required', code: 'MISSING_FIELDS' } });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        error: {
          message: 'Password must be at least 6 chars, contain 1 uppercase and 1 number',
          code: 'WEAK_PASSWORD',
        },
      });
    }

    const user = await User.findOne({ username: registrationNumber.toLowerCase() }).populate('studentRef');
    if (!user) return res.status(404).json({ error: { message: 'Student account not found', code: 'USER_NOT_FOUND' } });
    if (!user.isAccountLocked) return res.status(400).json({ error: { message: 'Account is already activated', code: 'ALREADY_ACTIVE' } });

    if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: { message: 'OTP is expired or invalid. Please request a new one.', code: 'OTP_EXPIRED' } });
    }

    const isValid = await bcrypt.compare(otp.toString(), user.otp);
    if (!isValid) {
      return res.status(400).json({ error: { message: 'Invalid activation code', code: 'INVALID_OTP' } });
    }

    // Success! Update password and unlock account
    user.passwordHash = newPassword; // Pre-save hook will hash it
    user.isAccountLocked = false;
    user.otp = null;
    user.otpExpiresAt = null;
    user.needsPasswordChange = false;
    user.needsProfileSetup = true; // Trigger first-time profile setup on next login

    await user.save();

    // Send Welcome Email
    if (user.studentRef && user.studentRef.email) {
      await sendWelcomeEmail(user.studentRef.email, user.studentRef.firstName || user.studentRef.fullName);
    }

    logger.info('Student account activated and password set', { userId: user._id, username: user.username });

    res.json({ message: 'Account successfully activated! You can now log in.' });
  } catch (error) {
    logger.error('Setup password error', { error: error.message });
    res.status(500).json({ error: { message: 'Failed to set up password', code: 'SETUP_PASSWORD_FAILED' } });
  }
};

const completeProfileSetup = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: { message: 'First name and Last name are required', code: 'MISSING_FIELDS' } });
    }

    const userId = req.user.userId || req.user._id;
    const user = await User.findById(userId).populate('studentRef');
    if (!user) return res.status(404).json({ error: { message: 'User not found', code: 'USER_NOT_FOUND' } });

    if (!user.studentRef) {
      return res.status(400).json({ error: { message: 'Student profile not found for this user', code: 'STUDENT_NOT_FOUND' } });
    }

    const student = user.studentRef;
    student.firstName = firstName.trim();
    student.lastName = lastName.trim();
    
    // Automatically construct fullName for system compatibility
    student.fullName = `${student.firstName} ${student.lastName}`;
    // Construct name with initials (naive but works for profile setup)
    const initials = student.firstName.charAt(0).toUpperCase();
    student.nameWithInitials = `${initials}. ${student.lastName}`;

    await student.save();

    user.needsProfileSetup = false;
    await user.save();

    logger.info('Student profile setup completed (Simplified)', { userId: user._id, firstName, lastName });

    res.json({
      message: 'Profile setup completed successfully!',
      user: {
        ...user.toJSON(),
        studentRef: student
      }
    });
  } catch (error) {
    logger.error('Profile setup error', { error: error.message });
    res.status(500).json({ error: { message: 'Failed to complete profile setup', code: 'SETUP_FAILED' } });
  }
};

const requestPasswordChangeOTP = async (req, res) => {
  try {
    const { currentPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword) {
      return res.status(400).json({ error: { message: 'Current password required to verify identity', code: 'MISSING_FIELDS' } });
    }

    const user = await User.findById(userId).populate('studentRef');
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found', code: 'USER_NOT_FOUND' } });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: { message: 'Invalid current password', code: 'INVALID_PASSWORD' } });
    }

    if (!user.studentRef || !user.studentRef.email) {
      return res.status(400).json({ error: { message: 'No email associated with profile', code: 'NO_EMAIL' } });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 mins for password change

    // Hash OTP
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    user.otp = hashedOtp;
    user.otpExpiresAt = expiresAt;
    await user.save();

    const emailSent = await sendPasswordChangeOTPEmail(user.studentRef.email, otp, user.studentRef.firstName || user.username);

    const maskedEmail = user.studentRef.email.replace(/(.{2})(.*)(?=@)/, (m, p, mid) => p + '*'.repeat(mid.length));
    
    res.json({ 
      success: true, 
      message: emailSent ? `Verification code sent to ${maskedEmail}` : 'Code generated but email failed. Contact admin.',
      email: maskedEmail 
    });
  } catch (error) {
    logger.error('Password change OTP request error', { error: error.message });
    res.status(500).json({ error: { message: 'Failed to request verification code', code: 'OTP_ERROR' } });
  }
};

const confirmPasswordChangeWithOTP = async (req, res) => {
  try {
    const { currentPassword, newPassword, otp } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword || !otp) {
      return res.status(400).json({ error: { message: 'All fields including OTP are required', code: 'MISSING_FIELDS' } });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ error: { message: 'Weak new password', code: 'WEAK_PASSWORD' } });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });

    // 1. Verify Current Password again for safety
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: { message: 'Invalid current password', code: 'INVALID_PASSWORD' } });
    }

    // 2. Verify OTP
    if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: { message: 'Verification code expired or invalid', code: 'OTP_EXPIRED' } });
    }

    const isOtpValid = await bcrypt.compare(otp.toString(), user.otp);
    if (!isOtpValid) {
      return res.status(400).json({ error: { message: 'Invalid verification code', code: 'INVALID_OTP' } });
    }

    // 3. Update Password
    user.passwordHash = newPassword;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    createNotification({
      recipient: user._id,
      type: 'security',
      title: 'Security Alert',
      body: 'Your password was successfully updated via email verification.',
      link: '/student/profile'
    }).catch(() => {});

    logger.info('Password updated with OTP', { userId: user._id });
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    logger.error('Confirm password change error', { error: error.message });
    res.status(500).json({ error: { message: 'Failed to update password', code: 'UPDATE_FAILED' } });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  changePassword,
  updatePreferences,
  requestOTP,
  verifyOTP,
  setupPassword,
  completeProfileSetup,
  requestPasswordChangeOTP,
  confirmPasswordChangeWithOTP
};
