/**
 * seedAll.js — Seeds hotels, demo host, and experience in one shot.
 * Run with: node seedAll.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const S3 = "https://airbnbclone-310342906720-eu-north-1-an.s3.eu-north-1.amazonaws.com/hotels";

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error("MONGODB_URI is required"); process.exit(1); }

  await mongoose.connect(uri, { dbName: "hotelsdb" });
  console.log("✅  Connected to MongoDB");

  const User = require('./models/User');
  const Hotel = require('./models/Hotel');

  // ── Create / find Demo Host ────────────────────────────────────────────────
  let demoHost = await User.findOne({ email: 'demo@airbnb.com' });
  if (!demoHost) {
    demoHost = await User.create({
      firstName: 'Demo', lastName: 'Host',
      email: 'demo@airbnb.com',
      password: await bcrypt.hash('password123', 10),
      role: 'host', isHost: true
    });
    console.log("Created Demo Host: demo@airbnb.com");
  } else {
    console.log("Demo Host exists:", demoHost.email);
  }

  // ── Create / find Test Experience Host ────────────────────────────────────
  let testHost = await User.findOne({ email: 'test@airbnb.com' });
  if (!testHost) {
    testHost = await User.create({
      firstName: 'Test', lastName: 'User',
      email: 'test@airbnb.com',
      password: await bcrypt.hash('password123', 10),
      role: 'host', isHost: true, isSuperhost: true
    });
    console.log("Created Test Host: test@airbnb.com");
  } else {
    console.log("Test Host exists:", testHost.email);
  }

  const commonDetails = {
    description: "Experience a wonderful stay in this beautiful location. This place offers a blend of modern amenities and local charm, perfect for your next getaway.",
    guests: 4, bedrooms: 2, beds: 2, baths: 1,
    amenities: ["Wifi", "Kitchen", "Free parking", "Air conditioning"],
    hostId: demoHost._id,
    hostName: "Demo Host",
    host: { name: "Demo Host", image: "https://a0.muscache.com/im/pictures/user/User-83344331-50e5-4f38-bc06-2d3fb84cdbd7.jpg" },
    propertyType: "Home",
  };

  const hotelsData = [
    // ── Udaipur ──────────────────────────────────────────────────────────────
    { id: 1, title: "Apartment in Udaipur", location: "Udaipur", price: "₹6,207", priceRaw: 6207, pricePerNight: 6207, rating: 4.8, ...commonDetails, image: `${S3}/hotel-1.jpeg`, images: [`${S3}/hotel-1.jpeg`] },
    { id: 2, title: "Room in Udaipur", location: "Udaipur", price: "₹7,989", priceRaw: 7989, pricePerNight: 7989, rating: 4.9, ...commonDetails, image: `${S3}/hotel-2.jpeg`, images: [`${S3}/hotel-2.jpeg`] },
    { id: 3, title: "Home in Udaipur", location: "Udaipur", price: "₹8,673", priceRaw: 8673, pricePerNight: 8673, rating: 5.0, ...commonDetails, image: `${S3}/hotel-3.jpeg`, images: [`${S3}/hotel-3.jpeg`] },
    { id: 4, title: "Room in Udaipur", location: "Udaipur", price: "₹6,000", priceRaw: 6000, pricePerNight: 6000, rating: 4.8, ...commonDetails, image: `${S3}/hotel-4.jpeg`, images: [`${S3}/hotel-4.jpeg`] },
    { id: 5, title: "Room in Pichola", location: "Pichola", price: "₹5,000", priceRaw: 5000, pricePerNight: 5000, rating: 4.9, ...commonDetails, image: `${S3}/hotel-5.jpeg`, images: [`${S3}/hotel-5.jpeg`] },
    { id: 6, title: "Home in Pichola", location: "Pichola", price: "₹3,000", priceRaw: 3000, pricePerNight: 3000, rating: 4.4, ...commonDetails, image: `${S3}/hotel-6.jpeg`, images: [`${S3}/hotel-6.jpeg`] },
    { id: 7, title: "Place to stay in Pichola", location: "Pichola", price: "₹4,600", priceRaw: 4600, pricePerNight: 4600, rating: 4.7, ...commonDetails, image: `${S3}/hotel-7.jpeg`, images: [`${S3}/hotel-7.jpeg`] },
    // ── Goa ──────────────────────────────────────────────────────────────────
    { id: 8, title: "Beach Villa in Goa", location: "North Goa", price: "₹9,500", priceRaw: 9500, pricePerNight: 9500, rating: 4.9, ...commonDetails, image: `${S3}/hotel-8.jpeg`, images: [`${S3}/hotel-8.jpeg`] },
    { id: 9, title: "Sea View Apartment", location: "Calangute", price: "₹7,200", priceRaw: 7200, pricePerNight: 7200, rating: 4.7, ...commonDetails, image: `${S3}/hotel-9.jpeg`, images: [`${S3}/hotel-9.jpeg`] },
    { id: 10, title: "Luxury Resort", location: "Baga", price: "₹12,000", priceRaw: 12000, pricePerNight: 12000, rating: 4.8, ...commonDetails, guests: 6, bedrooms: 3, beds: 3, baths: 2, amenities: ["Wifi", "Kitchen", "Pool", "Air conditioning", "Free parking"], image: `${S3}/hotel-10.jpeg`, images: [`${S3}/hotel-10.jpeg`] },
    { id: 11, title: "Budget Stay", location: "Anjuna", price: "₹3,500", priceRaw: 3500, pricePerNight: 3500, rating: 4.5, ...commonDetails, image: `${S3}/hotel-11.jpeg`, images: [`${S3}/hotel-11.jpeg`] },
    { id: 12, title: "Penthouse in Goa", location: "Panjim", price: "₹15,000", priceRaw: 15000, pricePerNight: 15000, rating: 5.0, ...commonDetails, guests: 8, bedrooms: 4, beds: 4, baths: 3, amenities: ["Wifi", "Kitchen", "Pool", "Air conditioning", "Gym", "Free parking"], image: `${S3}/hotel-12.jpeg`, images: [`${S3}/hotel-12.jpeg`] },
    { id: 13, title: "Home in Anjuna", location: "Anjuna", price: "₹6,400", priceRaw: 6400, pricePerNight: 6400, rating: 5.0, ...commonDetails, image: `${S3}/hotel-13.jpeg`, images: [`${S3}/hotel-13.jpeg`] },
    { id: 14, title: "Apartment in Siolim", location: "North Goa", price: "₹9,899", priceRaw: 9899, pricePerNight: 9899, rating: 4.8, ...commonDetails, image: `${S3}/hotel-14.jpeg`, images: [`${S3}/hotel-14.jpeg`] },
    { id: 15, title: "Apartment in Varca", location: "South Goa", price: "₹6,159", priceRaw: 6159, pricePerNight: 6159, rating: 4.9, ...commonDetails, image: `${S3}/hotel-15.jpeg`, images: [`${S3}/hotel-15.jpeg`] },
    // ── Mumbai ────────────────────────────────────────────────────────────────
    { id: 16, title: "Room in Bandra West", location: "Bandra", price: "₹7,532", priceRaw: 7532, pricePerNight: 7532, rating: 4.9, ...commonDetails, image: `${S3}/hotel-16.jpeg`, images: [`${S3}/hotel-16.jpeg`] },
    { id: 17, title: "Room in Santacruz East", location: "Mumbai", price: "₹5,989", priceRaw: 5989, pricePerNight: 5989, rating: 4.8, ...commonDetails, image: `${S3}/hotel-17.jpeg`, images: [`${S3}/hotel-17.jpeg`] },
    { id: 18, title: "Place to stay in Bandra West", location: "Bandra West", price: "₹8,973", priceRaw: 8973, pricePerNight: 8973, rating: 4.8, ...commonDetails, image: `${S3}/hotel-18.jpeg`, images: [`${S3}/hotel-18.jpeg`] },
    { id: 19, title: "Flat in Goregaon West", location: "Mumbai", price: "₹8,000", priceRaw: 8000, pricePerNight: 8000, rating: 4.9, ...commonDetails, image: `${S3}/hotel-19.jpeg`, images: [`${S3}/hotel-19.jpeg`] },
    { id: 20, title: "Studio Apartment in Bandra", location: "Bandra West", price: "₹7,600", priceRaw: 7600, pricePerNight: 7600, rating: 4.7, ...commonDetails, image: `${S3}/hotel-20.jpeg`, images: [`${S3}/hotel-20.jpeg`] },
    { id: 21, title: "Place to stay in Andheri", location: "Andheri West", price: "₹5,900", priceRaw: 5900, pricePerNight: 5900, rating: 4.4, ...commonDetails, image: `${S3}/hotel-21.jpeg`, images: [`${S3}/hotel-21.jpeg`] },
    { id: 22, title: "Apartment in Bandra", location: "Bandra East", price: "₹15,200", priceRaw: 15200, pricePerNight: 15200, rating: 4.9, ...commonDetails, guests: 5, bedrooms: 3, beds: 3, baths: 2, amenities: ["Wifi", "Kitchen", "Free parking", "Air conditioning", "Gym"], image: `${S3}/hotel-22.jpeg`, images: [`${S3}/hotel-22.jpeg`] },
  ];

  // ── Delete all existing non-Experience hotels (avoid duplicates) ───────────
  const delResult = await Hotel.deleteMany({ propertyType: { $ne: "Experience" } });
  console.log(`🗑️  Deleted ${delResult.deletedCount} old hotel docs`);

  await Hotel.insertMany(hotelsData);
  console.log(`✅  Inserted ${hotelsData.length} hotels`);

  // ── Seed the experience for test@airbnb.com ──────────────────────────────
  await Hotel.deleteMany({ propertyType: "Experience" });

  await Hotel.create({
    hostId: testHost._id,
    propertyType: "Experience",
    listingType: "Experience",
    location: "Mumbai, Maharashtra, India",
    lat: 18.9220, lng: 72.8347,
    title: "Hidden Gems of Colaba Walk with a Local History Nerd",
    description: "Discover the hidden colonial secrets of South Mumbai. We'll explore forgotten alleyways, hear stories of the British Raj, and eat the best Irani cafe completely off the tourist map.",
    guests: 10,
    bedrooms: 1, beds: 1, baths: 1,
    amenities: ["Snacks", "Drinks", "Tickets"],
    priceRaw: 1250, pricePerNight: 1250, price: "₹1,250",
    rating: 4.96,
    hostName: testHost.firstName,
    images: [
      "https://images.unsplash.com/photo-1570168007204-dfb528c6858f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620802051772-2ea90bfce81f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop"
    ],
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6858f?q=80&w=1200&auto=format&fit=crop",
  });
  console.log("✅  Seeded Experience for test@airbnb.com");

  await mongoose.disconnect();
  console.log("🎉  All done!");
}

seed().catch(err => { console.error(err); process.exit(1); });
