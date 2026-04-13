const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  title: String,
  location: String,
  pricePerNight: Number,
  rating: Number,
  images: [String],
}, { strict: false }); // Allow schema-less structure for existing data

module.exports = mongoose.model('Hotel', hotelSchema, 'hotels'); // Map to 'hotels' collection
