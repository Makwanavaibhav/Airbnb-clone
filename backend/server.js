require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 5001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173" })); // Vite dev server
app.use(express.json());

// ─── MongoDB Connection ───────────────────────────────────────────────────────
let db;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌  MONGODB_URI is not set in .env");
    process.exit(1);
  }
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  db = client.db("hotelsdb");
  console.log("✅  Connected to MongoDB Atlas (hotelsdb)");
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/hotels — all hotels
app.get("/api/hotels", async (req, res) => {
  try {
    const hotels = await db.collection("hotels").find({}).toArray();
    res.json(hotels);
  } catch (err) {
    console.error("GET /api/hotels error:", err);
    res.status(500).json({ error: "Failed to fetch hotels" });
  }
});

// GET /api/hotels/city/:city — hotels filtered by location (case-insensitive)
app.get("/api/hotels/city/:city", async (req, res) => {
  try {
    const cityMap = {
      udaipur: { $in: ["Udaipur", "Pichola"] },
      goa:     { $in: ["North Goa", "South Goa", "Calangute", "Baga", "Anjuna", "Panjim"] },
      mumbai:  { $in: ["Mumbai", "Bandra", "Bandra West", "Bandra East", "Andheri West"] },
    };
    const key = req.params.city.toLowerCase();
    const filter = cityMap[key]
      ? { location: cityMap[key] }
      : { location: { $regex: req.params.city, $options: "i" } };

    const hotels = await db.collection("hotels").find(filter).toArray();
    res.json(hotels);
  } catch (err) {
    console.error("GET /api/hotels/city error:", err);
    res.status(500).json({ error: "Failed to fetch hotels by city" });
  }
});

// GET /api/hotels/:id  — single hotel by numeric id field
app.get("/api/hotels/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const hotel = await db.collection("hotels").findOne({ id });
    if (!hotel) return res.status(404).json({ error: "Hotel not found" });
    res.json(hotel);
  } catch (err) {
    console.error("GET /api/hotels/:id error:", err);
    res.status(500).json({ error: "Failed to fetch hotel" });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ─── Start ───────────────────────────────────────────────────────────────────
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀  API running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌  DB connection failed:", err.message);
    process.exit(1);
  });
