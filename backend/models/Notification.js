const mongoose = require('mongoose');

/**
 * Notification — lightweight in-app notification record.
 * Displayed in the host's notification bell.
 */
const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['listing_submitted', 'listing_approved', 'listing_rejected', 'general', 'new_message'],
    default: 'general'
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  listing_id: { type: mongoose.Schema.Types.ObjectId, default: null },
  listing_type: { type: String, default: null }, // 'experience' | 'service'
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema, 'notifications');
