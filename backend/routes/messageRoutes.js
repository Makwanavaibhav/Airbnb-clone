const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Get all messages for a specific user
router.get('/:userId', protect, async (req, res) => {
  try {
    if (String(req.user._id) !== String(req.params.userId)) {
      return res.status(403).json({ error: 'Not authorized to read these messages' });
    }

    const messages = await Message.find({
      $or: [{ senderId: req.params.userId }, { receiverId: req.params.userId }]
    }).sort({ timestamp: 1 });
    
    // get unique user info to display names
    const userIds = [...new Set(messages.flatMap(m => [m.senderId.toString(), m.receiverId.toString()]))];
    const users = await User.find({ _id: { $in: userIds } }, 'firstName lastName image');
    
    const userMap = {};
    users.forEach(u => userMap[u._id.toString()] = u);

    res.json({ messages, userMap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
