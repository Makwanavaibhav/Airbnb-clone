const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * requireAdmin — middleware that ensures the caller is authenticated AND has role === 'admin'.
 * Must be placed AFTER authenticateToken (which sets req.user).
 */
const requireAdmin = async (req, res, next) => {
  try {
    // req.user is set by authenticateToken
    const userId = req.user?._id || req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const user = await User.findById(userId).select('role');
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (err) {
    console.error('requireAdmin error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { requireAdmin };
