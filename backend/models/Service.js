const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  city: { type: String, required: true },
  location: { type: String },
  pricePerSession: { type: Number, required: true },
  serviceType: { type: String, default: 'General' },
  images: [String],
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hostName: { type: String },
  rating: { type: Number, default: 4.9 },
  reviewCount: { type: Number, default: 0 },
  availability: [String],
  tags: [String],
  serviceArea: {
    lat: { type: Number },
    lng: { type: Number },
    radiusMeters: { type: Number, default: 15000 }
  },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema, 'services');
