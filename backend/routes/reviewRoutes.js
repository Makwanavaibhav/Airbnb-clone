const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Get all reviews for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.params.userId })
      .populate('hotelId', 'title images')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching reviews', error: error.message });
  }
});

module.exports = router;
