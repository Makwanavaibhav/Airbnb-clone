require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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

// ─── Bookings & Stripe ────────────────────────────────────────────────────────
app.post("/api/bookings/checkout", async (req, res) => {
  try {
    const { hotelId, startDate, endDate, totalPrice, totalDays, hotelName, hotelImage } = req.body;

    if (!hotelId || !startDate || !endDate || !totalPrice) {
      return res.status(400).json({ error: "Missing required booking details." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // 1. Check for overlapping dates
    // A booking overlaps if its start date is before our end date AND its end date is after our start date.
    const overlapping = await db.collection("bookings").find({
      hotelId: hotelId,
      $and: [
        { startDate: { $lt: end.toISOString() } },
        { endDate: { $gt: start.toISOString() } }
      ]
    }).toArray();

    if (overlapping.length > 0) {
      return res.status(409).json({ error: "Dates are no longer available. Please select different dates." });
    }

    // 2. If Stripe key is provided, create a real Stripe Checkout Session
    if (process.env.STRIPE_SECRET_KEY) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: `Stay at ${hotelName || 'Airbnb Home'}`,
                images: hotelImage ? [hotelImage] : [],
                description: `${totalDays} nights from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
              },
              unit_amount: Math.round(totalPrice * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `http://localhost:5173/api/bookings/success?hotelId=${hotelId}&startDate=${startDate}&endDate=${endDate}&totalPrice=${totalPrice}`,
        cancel_url: `http://localhost:5173/hotel/${hotelId}`,
      });

      return res.json({ url: session.url });
    } else {
      // 3. Fallback dummy booking if no Stripe key configured
      const result = await db.collection("bookings").insertOne({
        hotelId,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        totalPrice,
        status: "confirmed",
        createdAt: new Date()
      });
      console.log("Mock booking created:", result.insertedId);
      // Directly return to frontend success since it's already saved
      return res.json({ url: `http://localhost:5173/?booking_success=true` });
    }
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ error: "Failed to create booking session." });
  }
});

// GET /api/bookings/success - Handle successful payment & finalize booking
app.get("/api/bookings/success", async (req, res) => {
  try {
    const { hotelId, startDate, endDate, totalPrice } = req.query;
    if (hotelId && startDate && endDate) {
      await db.collection("bookings").insertOne({
        hotelId: parseInt(hotelId) || hotelId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        totalPrice: parseFloat(totalPrice) || 0,
        status: "confirmed",
        createdAt: new Date()
      });
    }
    // Redirect back to frontend
    res.redirect(`http://localhost:5173/?booking_success=true`);
  } catch (err) {
    console.error("Success Route Error:", err);
    res.redirect(`http://localhost:5173/?booking_error=true`);
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
// Forced restart to load stripe key
