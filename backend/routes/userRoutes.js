const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const { protect } = require('../middleware/authMiddleware');

// Get current user profile (Fix #9)
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
});

// Get user's wishlist
router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'title image images location price priceRaw pricePerNight rating');

    res.json({ 
      success: true, 
      wishlist: user.wishlist || [] 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching wishlist',
      error: error.message 
    });
  }
});

// Add hotel to wishlist
router.post('/wishlist', protect, async (req, res) => {
  try {
    const { hotelId } = req.body;

    const user = await User.findById(req.user._id);
    
    if (user.wishlist.includes(hotelId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Hotel already in wishlist' 
      });
    }

    user.wishlist.push(hotelId);
    await user.save();

    res.json({ 
      success: true, 
      message: 'Added to wishlist',
      wishlist: user.wishlist 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error adding to wishlist',
      error: error.message 
    });
  }
});

// Remove hotel from wishlist
router.delete('/wishlist/:hotelId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.wishlist = user.wishlist.filter(
      id => id.toString() !== req.params.hotelId
    );
    
    await user.save();

    res.json({ 
      success: true, 
      message: 'Removed from wishlist',
      wishlist: user.wishlist 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error removing from wishlist',
      error: error.message 
    });
  }
});

// Update user profile
router.patch('/profile', protect, async (req, res) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 'address'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating profile',
      error: error.message 
    });
  }
});

// Change password
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error changing password',
      error: error.message 
    });
  }
});

// Update preferences
router.patch('/preferences', protect, async (req, res) => {
  try {
    const { language, currency, timezone } = req.body;
    const existingUser = await User.findById(req.user._id).select('preferences');

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        preferences: {
          language: language || existingUser.preferences?.language,
          currency: currency || existingUser.preferences?.currency,
          timezone: timezone || existingUser.preferences?.timezone
        }
      },
      { new: true }
    ).select('-password');

    res.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating preferences',
      error: error.message 
    });
  }
});

// Get a specific user's public profile (for chat/messaging)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('firstName lastName image email');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;
