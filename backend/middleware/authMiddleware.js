const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Access denied. Please log in to continue." });

  jwt.verify(token, process.env.JWT_SECRET || "default_secret", (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token. Please log in again." });
    req.user = user;
    if (user.userId) {
      req.user._id = user.userId;
    }
    next();
  });
};

const protect = authenticateToken;

module.exports = {
  authenticateToken,
  protect
};
