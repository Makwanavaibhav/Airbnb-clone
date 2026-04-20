const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  city: { type: String, required: true },
  location: { type: String },
  pricePerPerson: { type: Number, required: true },
  duration: { type: String, default: '2 hours' },
  images: [String],
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hostName: { type: String },
  category: { type: String, default: 'Experience' },
  rating: { type: Number, default: 4.9 },
  reviewCount: { type: Number, default: 0 },
  groupSize: { type: Number, default: 10 },
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
}, { timestamps: true });

module.exports = mongoose.model('Experience', experienceSchema, 'experiences');
