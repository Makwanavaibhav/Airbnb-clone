const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  title: String,
  location: String,
  pricePerNight: Number,
  priceRaw: Number,
  price: String,           // formatted string e.g. "₹6,207"
  rating: { type: Number, default: 5.0 },
  images: [String],
  image: String,
  hostName: String,
  host: {
    name: String,
    image: String
  },
  description: String,
  guests: { type: mongoose.Schema.Types.Mixed }, // can be number or string
  dates: String,
  bedrooms: Number,
  beds: Number,
  baths: Number,
  amenities: [String],
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  propertyType: { type: String, default: 'Home' },  // 'Home' | 'Experience' | etc.
  listingType: String,
  lat: Number,
  lng: Number,
  coordinates: [Number],
  // Extended host-editable fields
  roomType: String,
  summary: String,
  houseRules: String,
  checkInTime: String,
  checkOutTime: String,
  exactAddress: String,
  neighborhoodDesc: String,
  weekendPrice: Number,
  securityDeposit: Number,
  discountPercent: Number,
  seasonalPricing: String,
  minNights: { type: Number, default: 1 },
  maxNights: { type: Number, default: 30 },
  instantBook: { type: Boolean, default: false },
  requiresVerifiedId: { type: Boolean, default: false },
  cancellationPolicy: { type: String, default: 'Flexible' },
  advanceNotice: { type: String, default: 'Same day' },
  prepTime: { type: String, default: 'None' },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Hotel', hotelSchema, 'hotels');
