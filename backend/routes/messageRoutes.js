const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

<<<<<<< HEAD
// Get all messages for a specific user
router.get('/:userId', protect, async (req, res) => {
=======
const { protect } = require('../middleware/authMiddleware');

// Get all conversations for a user
router.get('/conversations', protect, async (req, res) => {
>>>>>>> 322e9ce08a81d9a1adc18d6db9d28395011d8793
  try {
    if (String(req.user._id) !== String(req.params.userId)) {
      return res.status(403).json({ error: 'Not authorized to read these messages' });
    }

    const messages = await Message.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }]
    }).sort({ timestamp: -1 });

    const conversations = {};
    messages.forEach(msg => {
      if (!conversations[msg.conversationId]) {
         conversations[msg.conversationId] = msg;
      }
    });
    
    // get unique user info to display names
    const userIds = [...new Set(messages.flatMap(m => [m.senderId.toString(), m.receiverId.toString()]))];
    const users = await User.find({ _id: { $in: userIds } }, 'firstName lastName image');
    
    const userMap = {};
    users.forEach(u => userMap[u._id.toString()] = u);

    res.json({ success: true, threads: Object.values(conversations), userMap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all messages for a specific user (legacy) or conversation history
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let query = {};
    if (id.includes('_')) {
      query = { conversationId: id };
    } else {
      query = { $or: [{ senderId: id }, { receiverId: id }] };
    }
    
    const messages = await Message.find(query).sort({ timestamp: 1 });
    
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
