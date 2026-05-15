const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middleware/authMiddleware');

// ─── GET user's own reviews ──────────────────────────────────
// MUST be before /:targetType/:targetId so 'user' isn't treated as a targetType
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    // Populate hotel details for each hotel review
    const Hotel = require('../models/Hotel');
    const enriched = await Promise.all(reviews.map(async (r) => {
      const obj = r.toObject();
      if (r.targetType === 'hotel') {
        try {
          const hotel = await Hotel.findById(r.targetId).select('title images image location');
          obj.hotelId = hotel || null;
        } catch { obj.hotelId = null; }
      }
      return obj;
    }));

    res.json({ success: true, reviews: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching reviews', error: err.message });
  }
});

// ─── GET all reviews for a listing ────────────────────────────────────────────
// GET /api/reviews/:targetType/:targetId
router.get('/:targetType/:targetId', async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const reviews = await Review.find({ targetId, targetType })
      .populate('userId', 'firstName lastName profilePhoto')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching reviews', error: err.message });
  }
});

// ─── POST create a review ─────────────────────────────────────────────────────
// POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { targetId, targetType, rating, comment } = req.body;

    if (!targetId || !targetType || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'targetId, targetType, rating, and comment are required' });
    }

    if (!['hotel', 'experience', 'service'].includes(targetType)) {
      return res.status(400).json({ success: false, message: 'Invalid targetType' });
    }

    // Basic validation
    if (comment.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Review must be at least 10 characters' });
    }

    const review = await Review.create({
      userId: req.user._id,
      targetId,
      targetType,
      rating: Number(rating),
      comment: comment.trim(),
    });

    const populated = await review.populate('userId', 'firstName lastName profilePhoto');
    res.status(201).json({ success: true, review: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "You've already reviewed this listing" });
    }
    res.status(500).json({ success: false, message: 'Error creating review', error: err.message });
  }
});

// ─── DELETE a review ──────────────────────────────────────────────────────────
// DELETE /api/reviews/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (String(review.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting review', error: err.message });
  }
});

module.exports = router;
