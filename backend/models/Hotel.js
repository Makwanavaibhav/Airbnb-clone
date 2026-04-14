const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  title: String,
  location: String,
  pricePerNight: Number,
  priceRaw: Number, // Frontend seems to expect this based on Checkout.jsx
  rating: { type: Number, default: 5.0 },
  images: [String],
  image: String,
  hostName: String,
  host: {
    name: String,
    image: String
  },
  description: String,
  guests: String,
  dates: String,
  bedrooms: Number,
  beds: Number,
  baths: Number,
  amenities: [String],
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Hotel', hotelSchema, 'hotels');
