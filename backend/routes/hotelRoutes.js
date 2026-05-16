const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const { authenticateToken } = require("../middleware/authMiddleware");
const Hotel = require("../models/Hotel");

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
  console.log("No AWS Keys. S3 Uploads falling back to Unsplash dummy.");
  upload = multer({ storage: multer.memoryStorage() }); 
}

// POST /api/hotels (Host Dashboard Upload via S3 - Multi Image)
// We use .any() to handle both "image" (legacy) and "images" array for flexibility
router.post("/", authenticateToken, upload.any(), async (req, res) => {
  try {
    const { name, title, location, price, priceRaw, pricePerNight, rating, hostName, description, guests, bedrooms, beds, baths, amenities } = req.body;
    
    const hotelTitle = title || name;
    const hotelPrice = pricePerNight || priceRaw || price;

    if (!hotelTitle || !location || !hotelPrice) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    let imageUrls = [];
    
    // Process uploaded files
    if (req.files && req.files.length > 0) {
      if (process.env.AWS_ACCESS_KEY_ID) {
        imageUrls = req.files.map(file => file.location);
      } else {
        // Dummy fallback for testing without S3
        imageUrls = [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1542314831-c6a4d14d8373?auto=format&fit=crop&w=800&q=80"
        ];
      }
    } else {
      imageUrls = ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"];
    }

    // Parse arrays/JSON strings from FormData
    let parsedAmenities = [];
    if (typeof amenities === 'string') {
      try { parsedAmenities = JSON.parse(amenities); } catch(e) { parsedAmenities = amenities.split(','); }
    } else if (Array.isArray(amenities)) {
      parsedAmenities = amenities;
    }

    const newHotel = new Hotel({
      title: hotelTitle,
      location,
      pricePerNight: parseInt(hotelPrice),
      priceRaw: parseInt(hotelPrice),
      rating: parseFloat(rating) || 5.0,
      hostName: hostName || req.user?.firstName || "Independent Host",
      hostId: req.user?._id,
      image: imageUrls[0], // for legacy support
      images: imageUrls,
      description: description || "Beautiful property waiting for you.",
      guests: guests || "1-4 guests",
      dates: "Flexible dates",
      bedrooms: parseInt(bedrooms) || 1,
      beds: parseInt(beds) || 1,
      baths: parseInt(baths) || 1,
      amenities: parsedAmenities,
      // New listings from the wizard are published immediately
      status: req.body.status === 'draft' ? 'draft' : 'published',
    });

    const savedHotel = await newHotel.save();
    res.status(201).json({ message: "Hotel created successfully", hotelId: savedHotel._id, id: savedHotel._id, url: imageUrls[0], images: imageUrls });
  } catch (err) {
    console.error("POST /api/hotels error:", err);
    res.status(500).json({ error: "Failed to upload property" });
  }
});

// GET /api/hotels/cities
router.get("/cities", async (req, res) => {
  try {
    // Only get distinct locations for published, non-Experience listings
    const locations = await Hotel.find({ propertyType: { $ne: "Experience" }, status: "published" }).distinct("location");
    // Extract unique cities (using the part before first comma), proper case
    const cityMap = new Map();
    locations.forEach(loc => {
      const city = loc.split(',')[0].trim();
      const lower = city.toLowerCase();
      if (city && !cityMap.has(lower)) {
        cityMap.set(lower, city);
      }
    });
    res.json({ success: true, cities: Array.from(cityMap.values()) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cities" });
  }
});

// GET /api/hotels/search — Advanced Search endpoint (published only)
router.get("/search", async (req, res) => {
  try {
    const { city, minPrice, maxPrice, propertyType, guests } = req.query;
    // Always restrict public search to published listings only
    let filter = { status: "published" };

    if (city) {
      filter.location = { $regex: city, $options: "i" };
    }
    
    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = parseInt(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = parseInt(maxPrice);
    }

    if (propertyType) {
      filter.propertyType = propertyType;
    }

    const hotels = await Hotel.find(filter);

    // Filter by guest capacity after fetch (guests field can be a number or a string)
    let results = hotels;
    if (guests) {
      const requested = parseInt(guests, 10);
      if (!isNaN(requested) && requested > 0) {
        results = hotels.filter(h => {
          const raw = h.guests;
          if (typeof raw === 'number') return raw >= requested;
          if (typeof raw === 'string') {
            const nums = raw.match(/\d+/g);
            if (nums) return parseInt(nums[nums.length - 1], 10) >= requested;
          }
          return true; // if field absent, include listing
        });
      }
    }

    res.json(results);
  } catch (err) {
    console.error("GET /api/hotels/search error:", err);
    res.status(500).json({ error: "Failed to search hotels" });
  }
});

// GET /api/hotels/city/:city — hotels filtered by location (legacy, published only)
router.get("/city/:city", async (req, res) => {
  try {
    const cityMap = {
      udaipur: { $in: ["Udaipur", "Pichola", "udaipur"] },
      goa:     { $in: ["North Goa", "South Goa", "Calangute", "Baga", "Anjuna", "Panjim", "goa"] },
      mumbai:  { $in: ["Mumbai", "Bandra", "Bandra West", "Bandra East", "Andheri West", "mumbai"] },
    };
    const key = req.params.city.toLowerCase();
    
    const filter = cityMap[key]
      ? { location: cityMap[key] }
      : { location: { $regex: req.params.city, $options: "i" } };

    // Do not include Experiences and only show published listings
    filter.propertyType = { $ne: "Experience" };
    filter.status = "published";

    const hotels = await Hotel.find(filter);
    res.json(hotels);
  } catch (err) {
    console.error("GET /api/hotels/city error:", err);
    res.status(500).json({ error: "Failed to fetch hotels by city" });
  }
});

// HOST DASHBOARD API

// GET /api/hotels/host/me — get ALL host listings (including drafts)
router.get("/host/me", authenticateToken, async (req, res) => {
  try {
    const properties = await Hotel.find({ hostId: req.user._id });
    res.json({ success: true, properties });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

// PATCH /api/hotels/:id/status — host publish or unpublish a listing
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['draft', 'published'].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be 'draft' or 'published'." });
    }

    const hotel = await Hotel.findOneAndUpdate(
      { _id: req.params.id, hostId: req.user._id },
      { $set: { status } },
      { returnDocument: 'after' }
    );

    if (!hotel) return res.status(404).json({ error: "Listing not found or unauthorized" });
    res.json({ success: true, hotel });
  } catch (err) {
    console.error("PATCH /api/hotels/:id/status error:", err);
    res.status(500).json({ error: "Failed to update listing status" });
  }
});

// PUT /api/hotels/:id — host update listing
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const hostId = req.user._id;

    let hotel;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      hotel = await Hotel.findOneAndUpdate(
        { _id: id, hostId: hostId },
        { $set: req.body },
        { returnDocument: 'after' }
      );
    } else {
      hotel = await Hotel.findOneAndUpdate(
        { id: parseInt(id), hostId: hostId },
        { $set: req.body },
        { returnDocument: 'after' }
      );
    }

    if (!hotel) return res.status(404).json({ error: "Listing not found or unauthorized" });
    res.json({ success: true, hotel });
  } catch (err) {
    console.error("PUT /api/hotels/:id error:", err);
    res.status(500).json({ error: "Failed to update property" });
  }
});

// DELETE /api/hotels/:id — host delete listing
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const hostId = req.user._id;

    // 1. Find the property first to ensure ownership and get its ObjectId
    let hotel;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      hotel = await Hotel.findOne({ _id: id, hostId: hostId });
    } else {
      hotel = await Hotel.findOne({ id: parseInt(id), hostId: hostId });
    }

    if (!hotel) {
      return res.status(404).json({ error: "Listing not found or unauthorized" });
    }

    const hotelObjectId = hotel._id;

    // 2. Cascade delete associated data
    const Booking = require("../models/Booking");
    const Review = require("../models/Review");

    await Promise.all([
      Hotel.deleteOne({ _id: hotelObjectId }),
      Booking.deleteMany({ hotelId: hotelObjectId }),
      Review.deleteMany({ hotelId: hotelObjectId })
    ]);

    console.log(`Permanently deleted listing ${hotelObjectId} and its associations.`);
    res.json({ success: true, message: "Listing and all associated data permanently deleted" });
  } catch (err) {
    console.error("DELETE /api/hotels/:id error:", err);
    res.status(500).json({ error: "Failed to delete property and its associations" });
  }
});

// NOTE: Reviews are handled exclusively by /api/reviews (reviewRoutes.js)
// which uses the canonical schema { targetId, targetType, rating, comment }.
// The old /api/hotels/:id/reviews routes have been removed to avoid schema conflicts.

// GET /api/hotels — published hotels only (public listing feed)
// IMPORTANT: This must be declared before GET /:id to avoid route shadowing.
router.get("/", async (req, res) => {
  try {
    const hotels = await Hotel.find({ status: "published" });
    res.json(hotels);
  } catch (err) {
    console.error("GET /api/hotels error:", err);
    res.status(500).json({ error: "Failed to fetch hotels" });
  }
});

// GET /api/hotels/:id  — single hotel by id
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // Allow lookup by Mongoose ObjectId or legacy string ID mapping if necessary
    let hotel;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      hotel = await Hotel.findById(id);
    } else {
       // Legacy numeric fallback if frontend hasn't completely flushed old data
       hotel = await Hotel.findOne({ id: parseInt(id) });
    }
    
    if (!hotel) return res.status(404).json({ error: "Hotel not found" });
    res.json(hotel);
  } catch (err) {
    console.error("GET /api/hotels/:id error:", err);
    res.status(500).json({ error: "Failed to fetch hotel" });
  }
});

module.exports = router;
