const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const authenticateToken = require("../middleware/authMiddleware");

// S3 Configuration Fallback 
let upload;

if (process.env.AWS_ACCESS_KEY_ID) {
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        const ext = file.originalname.split('.').pop() || 'jpg';
        cb(null, `hotels/${Date.now().toString()}-${Math.random().toString(36).substring(7)}.${ext}`);
      },
    }),
  });
} else {
  // Graceful fallback to memory storage without crashing the server if keys are missing
  console.log("No AWS Keys. S3 Uploads falling back to Unsplash dummy.");
  upload = multer({ storage: multer.memoryStorage() }); 
}

// POST /api/hotels (Host Dashboard Upload via S3)
router.post("/", authenticateToken, upload.single("image"), async (req, res) => {
  const db = req.app.locals.db;
  try {
    const { name, location, price, rating, hostName } = req.body;
    
    if (!name || !location || !price) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    let imageUrl = "";

    if (process.env.AWS_ACCESS_KEY_ID && req.file) {
      imageUrl = req.file.location; // Assigned successfully by S3
    } else {
      // Hardware dummy link if they try to post without dot env setups
       imageUrl = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
    }
    
    // Auto-increment traditional ID schema for frontend legacy integrations
    const lastHotelArray = await db.collection("hotels").find().sort({ id: -1 }).limit(1).toArray();
    const newId = lastHotelArray.length > 0 ? (lastHotelArray[0].id + 1) : 1;

    const newHotel = {
      id: newId,
      name,
      location,
      price: parseInt(price),
      rating: parseFloat(rating) || 5.0,
      hostName: hostName || "Independent Host",
      image: imageUrl,
      dates: "Flexible dates",
      guests: "1-4 guests",
      createdAt: new Date()
    };

    const result = await db.collection("hotels").insertOne(newHotel);
    res.status(201).json({ message: "Hotel created successfully", hotelId: result.insertedId, url: imageUrl });

  } catch (err) {
    console.error("POST /api/hotels error:", err);
    res.status(500).json({ error: "Failed to upload property" });
  }
});

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
