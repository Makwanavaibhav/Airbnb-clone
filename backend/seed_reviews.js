require("dotenv").config();
const mongoose = require("mongoose");
const Hotel = require("./models/Hotel");
const Review = require("./models/Review");
const User = require("./models/User");

const MOCK_REVIEWS = [
  "Amazing stay! Will definitely be coming back.",
  "Great location, super responsive host.",
  "Very clean and comfortable, but could use more amenities.",
  "Spectacular view and wonderful service. Five stars!",
  "Cozy place, perfect for a short stay.",
  "The property wasn't as clean as expected, but the location was great.",
  "Highly recommend this spot for an authentic local experience.",
  "An absolute gem! Even better than the pictures.",
  "Decent place, value for money.",
  "Host was lovely. The bed was extremely comfortable."
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return console.error("No MONGODB_URI");

  await mongoose.connect(uri, { dbName: "hotelsdb" });
  console.log("Connected to hotelsdb");

  const hotels = await Hotel.find();
  
  let dummyUser = await User.findOne({ email: "dummy@seed.com" });
  if (!dummyUser) {
     dummyUser = await User.create({
         firstName: "Traveler",
         lastName: "Seed",
         email: "dummy@seed.com",
         password: "password123",
         createdAt: new Date()
     });
  }

  for (const hotel of hotels) {
     const baseRating = hotel.rating || 4.5;
     const count = Math.floor(Math.random() * 4) + 1; // 1 to 4 reviews
     console.log(`Seeding ${count} reviews for ${hotel.title || hotel.name}`);
     
     for (let i = 0; i < count; i++) {
        let jitter = (Math.random() - 0.5); // -0.5 to 0.5
        let reviewRating = Math.max(1, Math.min(5, Math.round(baseRating + jitter)));
        const text = MOCK_REVIEWS[Math.floor(Math.random() * MOCK_REVIEWS.length)];
        await Review.create({
           userId: dummyUser._id,
           hotelId: hotel._id,
           rating: reviewRating,
           text: text
        });
     }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed();
