const mongoose = require('mongoose');

const experienceBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  experienceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Experience', required: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date },
  guests: { type: Number, required: true, default: 1 },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },
  bookingType: { type: String, default: 'experience' },
  paymentIntentId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExperienceBooking', experienceBookingSchema, 'experiencebookings');
