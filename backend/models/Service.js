const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  shortDescription: { type: String },
  city: { type: String, required: true },
  location: { type: String },
  isRemote: { type: Boolean, default: false },
  pricePerSession: { type: Number, required: true },
  serviceType: { type: String, default: 'General' },
  images: [String],
  coverImageIndex: { type: Number, default: 0 },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hostName: { type: String },
  rating: { type: Number, default: 4.9 },
  reviewCount: { type: Number, default: 0 },
  availability: [String],
  timeSlots: [String],
  tags: [String],
  serviceArea: {
    lat: { type: Number },
    lng: { type: Number },
    radiusMeters: { type: Number, default: 15000 }
  },
  // ── Listing lifecycle ──────────────────────────────────────────────────────
  listing_status: {
    type: String,
    enum: ['draft', 'pending_review', 'active', 'rejected'],
    default: 'draft'
  },
  visibility: { type: Boolean, default: false },
  rejection_reason: { type: String, default: null },
  submitted_at: { type: Date, default: null },
  reviewed_at: { type: Date, default: null },
  reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema, 'services');
