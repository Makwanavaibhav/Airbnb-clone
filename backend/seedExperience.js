const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

// Connect to the DB
mongoose.connect(process.env.MONGODB_URI, { dbName: "hotelsdb" }).then(async () => {
    // Dynamically load models
    const User = require("./models/User");
    const Hotel = require("./models/Hotel");

    let testUser = await User.findOne({ email: "test@airbnb.com" });
    if (!testUser) {
        testUser = await User.create({
            firstName: "Test",
            lastName: "User",
            email: "test@airbnb.com",
            password: await bcrypt.hash("password123", 10),
            role: "host",
            isSuperhost: true,
            createdAt: new Date()
        });
    }

    // Ensure they have 'host' role
    if (testUser.role !== 'host') {
        testUser.role = 'host';
        await testUser.save();
    }

    // Delete existing old mock experiences
    await Hotel.deleteMany({ propertyType: "Experience" });

    const newExp = await Hotel.create({
        hostId: testUser._id,
        propertyType: "Experience",
        listingType: "Experience",
        location: "Mumbai, Maharashtra, India",
        lat: 18.9220,
        lng: 72.8347,
        title: "Hidden Gems of Colaba Walk with a Local History Nerd",
        description: "Discover the hidden colonial secrets of South Mumbai. We'll explore forgotten alleyways, hear stories of the British Raj, and eat the best Irani cafe completely off the tourist map.",
        guests: 10,
        bedrooms: 1,
        beds: 1,
        baths: 1,
        amenities: ["Snacks", "Drinks", "Tickets"],
        priceRaw: 1250,
        pricePerNight: 1250,
        rating: 4.96,
        images: [
            "https://images.unsplash.com/photo-1570168007204-dfb528c6858f?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1620802051772-2ea90bfce81f?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop"
        ],
        hostName: testUser.firstName,
    });
    console.log("SEEDED_EXPERIENCE_ID:", newExp._id);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
