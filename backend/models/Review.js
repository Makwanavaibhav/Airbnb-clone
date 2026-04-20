const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  targetType: { type: String, enum: ['hotel', 'experience', 'service'], required: true },
  rating:     { type: Number, min: 1, max: 5, required: true },
  comment:    { type: String, required: true, maxlength: 1000 },
  createdAt:  { type: Date, default: Date.now }
});

// Prevent duplicate reviews: one review per user per listing
reviewSchema.index({ userId: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
