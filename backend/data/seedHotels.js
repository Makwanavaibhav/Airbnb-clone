require("dotenv").config();
const { MongoClient } = require("mongodb");

// ─── S3 Base URL ─────────────────────────────────────────────────────────────
const S3 = "https://airbnbclone-310342906720-eu-north-1-an.s3.eu-north-1.amazonaws.com/hotels";

// ─── Shared details applied to every hotel ───────────────────────────────────
const commonDetails = {
  host: {
    name: "Host Name",
    joined: "Joined in 2020",
    image: "https://i.pravatar.cc/150?img=33",
  },
  guests: 4,
  bedrooms: 2,
  beds: 2,
  baths: 1,
  description:
    "Experience a wonderful stay in this beautiful location. This place offers a blend of modern amenities and local charm, perfect for your next getaway.",
  amenities: ["Wifi", "Kitchen", "Free parking", "Air conditioning"],
  coordinates: [24.5854, 73.7125],
};

// ─── Hotels Data (22 listings) ───────────────────────────────────────────────
const hotels = [
  // ── Udaipur (IDs 1–7) ──────────────────────────────────────────────────────
  {
    id: 1,
    title: "Apartment in Udaipur",
    location: "Udaipur",
    price: "₹6,207",
    priceRaw: 6207,
    period: "2 nights",
    rating: "4.8",
    image: `${S3}/hotel-1.jpeg`,
    ...commonDetails,
    host: { ...commonDetails.host, name: "Vaibhav" },
    coordinates: [24.5854, 73.7125],
  },
  {
    id: 2,
    title: "Room in Udaipur",
    location: "Udaipur",
    price: "₹7,989",
    priceRaw: 7989,
    period: "2 nights",
    rating: "4.9",
    image: `${S3}/hotel-2.jpeg`,
    ...commonDetails,
    coordinates: [24.5731, 73.6855],
  },
  {
    id: 3,
    title: "Home in Udaipur",
    location: "Udaipur",
    price: "₹8,673",
    priceRaw: 8673,
    period: "4 nights",
    rating: "5.0",
    image: `${S3}/hotel-3.jpeg`,
    ...commonDetails,
    coordinates: [24.5789, 73.6942],
  },
  {
    id: 4,
    title: "Room in Udaipur",
    location: "Udaipur",
    price: "₹6,000",
    priceRaw: 6000,
    period: "3 nights",
    rating: "4.8",
    image: `${S3}/hotel-4.jpeg`,
    ...commonDetails,
    coordinates: [24.5812, 73.7041],
  },
  {
    id: 5,
    title: "Room in Pichola",
    location: "Pichola",
    price: "₹5,000",
    priceRaw: 5000,
    period: "2 nights",
    rating: "4.9",
    image: `${S3}/hotel-5.jpeg`,
    ...commonDetails,
    coordinates: [24.5744, 73.6812],
  },
  {
    id: 6,
    title: "Home in pichola",
    location: "Pichola",
    price: "₹3,000",
    priceRaw: 3000,
    period: "2 nights",
    rating: "4.4",
    image: `${S3}/Hotel-6.jpeg`,
    ...commonDetails,
    coordinates: [24.5712, 73.6799],
  },
  {
    id: 7,
    title: "Place to stay in pichola",
    location: "Pichola",
    price: "₹4,600",
    priceRaw: 4600,
    period: "3 nights",
    rating: "4.7",
    image: `${S3}/Hotel-7.jpeg`,
    ...commonDetails,
    coordinates: [24.5698, 73.6771],
  },

  // ── Goa (IDs 8–15) ─────────────────────────────────────────────────────────
  {
    id: 8,
    title: "Beach Villa in Goa",
    location: "North Goa",
    price: "₹9,500",
    priceRaw: 9500,
    period: "2 nights",
    rating: "4.9",
    image: `${S3}/Hotel-8.jpeg`,
    ...commonDetails,
    coordinates: [15.5937, 73.7371],
  },
  {
    id: 9,
    title: "Sea View Apartment",
    location: "Calangute",
    price: "₹7,200",
    priceRaw: 7200,
    period: "3 nights",
    rating: "4.7",
    image: `${S3}/hotel-9.jpeg`,
    ...commonDetails,
    coordinates: [15.5444, 73.7553],
  },
  {
    id: 10,
    title: "Luxury Resort",
    location: "Baga",
    price: "₹12,000",
    priceRaw: 12000,
    period: "2 nights",
    rating: "4.8",
    image: `${S3}/hotel-10.jpeg`,
    ...commonDetails,
    guests: 6,
    bedrooms: 3,
    beds: 3,
    baths: 2,
    amenities: ["Wifi", "Kitchen", "Pool", "Air conditioning", "Free parking"],
    coordinates: [15.5573, 73.7511],
  },
  {
    id: 11,
    title: "Budget Stay",
    location: "Anjuna",
    price: "₹3,500",
    priceRaw: 3500,
    period: "2 nights",
    rating: "4.5",
    image: `${S3}/hotel-11.jpeg`,
    ...commonDetails,
    coordinates: [15.5756, 73.7412],
  },
  {
    id: 12,
    title: "Penthouse in Goa",
    location: "Panjim",
    price: "₹15,000",
    priceRaw: 15000,
    period: "3 nights",
    rating: "5.0",
    image: `${S3}/Hotel-12.jpeg`,
    ...commonDetails,
    guests: 8,
    bedrooms: 4,
    beds: 4,
    baths: 3,
    amenities: ["Wifi", "Kitchen", "Pool", "Air conditioning", "Gym", "Free parking"],
    coordinates: [15.4909, 73.8278],
  },
  {
    id: 13,
    title: "Home in Anjuna",
    location: "Anjuna",
    price: "₹6,400",
    priceRaw: 6400,
    period: "2 nights",
    rating: "5.0",
    image: `${S3}/Hotel-13.jpeg`,
    ...commonDetails,
    coordinates: [15.5783, 73.7398],
  },
  {
    id: 14,
    title: "Apartment in Siolim",
    location: "North Goa",
    price: "₹9,899",
    priceRaw: 9899,
    period: "2 nights",
    rating: "4.8",
    image: `${S3}/Hotel-14.jpeg`,
    ...commonDetails,
    coordinates: [15.6262, 73.7648],
  },
  {
    id: 15,
    title: "Apartment in Varca",
    location: "South Goa",
    price: "₹6,159",
    priceRaw: 6159,
    period: "2 nights",
    rating: "4.9",
    image: `${S3}/Hotel-15.jpeg`,
    ...commonDetails,
    coordinates: [15.2282, 73.9507],
  },

  // ── Mumbai (IDs 16–22) ─────────────────────────────────────────────────────
  {
    id: 16,
    title: "Room in Bandra West",
    location: "Bandra",
    price: "₹7,532",
    priceRaw: 7532,
    period: "2 nights",
    rating: "4.9",
    image: `${S3}/Hotel-16.jpeg`,
    ...commonDetails,
    coordinates: [19.0596, 72.8295],
  },
  {
    id: 17,
    title: "Room in Santacruz East",
    location: "Mumbai",
    price: "₹5,989",
    priceRaw: 5989,
    period: "2 nights",
    rating: "4.8",
    image: `${S3}/Hotel-17.jpeg`,
    ...commonDetails,
    coordinates: [19.0822, 72.8498],
  },
  {
    id: 18,
    title: "Place to stay",
    location: "Bandra West",
    price: "₹8,973",
    priceRaw: 8973,
    period: "3 nights",
    rating: "4.8",
    image: `${S3}/Hotel-18.jpeg`,
    ...commonDetails,
    coordinates: [19.0621, 72.8321],
  },
  {
    id: 19,
    title: "Flat in Goregaon West",
    location: "Mumbai",
    price: "₹8,000",
    priceRaw: 8000,
    period: "2 nights",
    rating: "4.9",
    image: `${S3}/Hotel-19.jpeg`,
    ...commonDetails,
    coordinates: [19.1663, 72.8526],
  },
  {
    id: 20,
    title: "Studio Apartment",
    location: "Bandra West",
    price: "₹7,600",
    priceRaw: 7600,
    period: "2 nights",
    rating: "4.7",
    image: `${S3}/Hotel-20.jpeg`,
    ...commonDetails,
    coordinates: [19.0562, 72.8341],
  },
  {
    id: 21,
    title: "Place to stay",
    location: "Andheri West",
    price: "₹5,900",
    priceRaw: 5900,
    period: "2 nights",
    rating: "4.4",
    image: `${S3}/Hotel-21.jpeg`,
    ...commonDetails,
    coordinates: [19.1197, 72.8464],
  },
  {
    id: 22,
    title: "Apartment in Bandra",
    location: "Bandra East",
    price: "₹15,200",
    priceRaw: 15200,
    period: "4 nights",
    rating: "4.9",
    image: `${S3}/Hotel-22.jpeg`,
    ...commonDetails,
    guests: 5,
    bedrooms: 3,
    beds: 3,
    baths: 2,
    amenities: ["Wifi", "Kitchen", "Free parking", "Air conditioning", "Gym"],
    coordinates: [19.0544, 72.8402],
  },
];

// ─── Main Seed Function ───────────────────────────────────────────────────────
async function seedHotels() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌  MONGODB_URI is not set. Create a .env file with:\n   MONGODB_URI=your_atlas_connection_string");
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000, // 10-second timeout
  });

  try {
    console.log("🔌  Connecting to MongoDB Atlas...");
    await client.connect();
    console.log("✅  Connected successfully.\n");

    const db = client.db("hotelsdb");
    const collection = db.collection("hotels");

    // ── Check existing count ──
    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️   Found ${existingCount} existing document(s) in 'hotels'. Deleting all...`);
      const deleteResult = await collection.deleteMany({});
      console.log(`🗑️   Deleted ${deleteResult.deletedCount} document(s).\n`);
    } else {
      console.log("📭  Collection is empty — proceeding with fresh insert.\n");
    }

    // ── Seed ──
    console.log(`📦  Inserting ${hotels.length} hotels...`);
    const insertResult = await collection.insertMany(hotels, { ordered: true });

    // ── Validate ──
    if (insertResult.insertedCount !== hotels.length) {
      throw new Error(
        `Insert count mismatch: expected ${hotels.length}, got ${insertResult.insertedCount}`
      );
    }

    console.log(`✅  Successfully inserted ${insertResult.insertedCount} hotels.\n`);

    // ── Summary ──
    const udaipurCount = hotels.filter((h) => h.id <= 7).length;
    const goaCount = hotels.filter((h) => h.id > 7 && h.id <= 15).length;
    const mumbaiCount = hotels.filter((h) => h.id > 15).length;

    console.log("📊  Breakdown:");
    console.log(`     Udaipur : ${udaipurCount} hotels (IDs 1–7)`);
    console.log(`     Goa     : ${goaCount} hotels (IDs 8–15)`);
    console.log(`     Mumbai  : ${mumbaiCount} hotels (IDs 16–22)`);
    console.log("\n🎉  Database seeded successfully!");
  } catch (err) {
    console.error("\n❌  Seeding failed:", err.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log("🔌  MongoDB connection closed.");
  }
}

seedHotels();
