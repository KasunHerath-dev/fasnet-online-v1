const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: { message: 'No token provided', code: 'NO_TOKEN' } });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: { message: 'Invalid or inactive user', code: 'INVALID_USER' } });
    }

    if (user.isAccountLocked && req.path !== '/complete-profile-setup') {
      return res.status(403).json({ error: { message: 'Account is locked for security re-verification.', code: 'ACCOUNT_LOCKED' } });
    }

    req.user = user;

    // Track user activity (throttle to 1 minute)
    const now = new Date();
    if (!user.lastActiveAt || now.getTime() - new Date(user.lastActiveAt).getTime() > 60000) {
      await User.findByIdAndUpdate(user._id, { lastActiveAt: now });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: { message: 'Invalid token', code: 'INVALID_TOKEN' } });
  }
};

const roleMiddleware = (...args) => {
  const allowedRoles = args.flat();
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } });
    }

    const hasRole = req.user.roles.some((role) => 
      allowedRoles.map(r => r.toLowerCase()).includes(role.toLowerCase())
    );
    
    if (!hasRole) {
      console.warn(`[Auth] Access Denied. User: ${req.user.username}, Roles: ${req.user.roles}, Required: ${allowedRoles}`);
      return res.status(403).json({ error: { message: 'Forbidden', code: 'FORBIDDEN' } });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  roleMiddleware,
  protect: authMiddleware,
  authorize: roleMiddleware
};
