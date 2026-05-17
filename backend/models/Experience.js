const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  shortDescription: { type: String },
  city: { type: String, required: true },
  location: { type: String },
  isRemote: { type: Boolean, default: false },
  pricePerPerson: { type: Number, required: true },
  duration: { type: String, default: '2 hours' },
  images: [String],
  coverImageIndex: { type: Number, default: 0 },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hostName: { type: String },
  category: { type: String, default: 'Experience' },
  rating: { type: Number, default: 4.9 },
  reviewCount: { type: Number, default: 0 },
  groupSize: { type: Number, default: 10 },
  availableDays: { type: [String], default: [] },
  slotDurationMinutes: { type: Number },
  slotsStartTime: { type: String },
  slotsEndTime: { type: String },
  availableDates: [
    {
      date: Date,
      timeRange: String,
      spotsAvailable: { type: Number, default: 10 }
    }
  ],
  freeCancellation: { type: Boolean, default: true },
  tags: [String],
  meetingPoint: {
    address: { type: String },
    lat: { type: Number },
    lng: { type: Number }
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

module.exports = mongoose.model('Experience', experienceSchema, 'experiences');
