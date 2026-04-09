const express = require("express");
const router = express.Router();

// GET /api/hotels — all hotels
router.get("/", async (req, res) => {
  const db = req.app.locals.db;
  try {
    const hotels = await db.collection("hotels").find({}).toArray();
    res.json(hotels);
  } catch (err) {
    console.error("GET /api/hotels error:", err);
    res.status(500).json({ error: "Failed to fetch hotels" });
  }
});

// GET /api/hotels/city/:city — hotels filtered by location (case-insensitive)
router.get("/city/:city", async (req, res) => {
  const db = req.app.locals.db;
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
router.get("/:id", async (req, res) => {
  const db = req.app.locals.db;
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

module.exports = router;
