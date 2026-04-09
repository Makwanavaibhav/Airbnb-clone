const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const authenticateToken = require("../middleware/authMiddleware");

// POST /api/bookings/checkout
router.post("/checkout", authenticateToken, async (req, res) => {
  const db = req.app.locals.db;
  try {
    const { hotelId, startDate, endDate, totalPrice, totalDays, hotelName, hotelImage } = req.body;

    if (!hotelId || !startDate || !endDate || !totalPrice) {
      return res.status(400).json({ error: "Missing required booking details." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

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
      const result = await db.collection("bookings").insertOne({
        hotelId,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        totalPrice,
        status: "confirmed",
        createdAt: new Date()
      });
      return res.json({ url: `http://localhost:5173/?booking_success=true` });
    }
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ error: "Failed to create booking session." });
  }
});

// GET /api/bookings/success - Handle successful payment
router.get("/success", async (req, res) => {
  const db = req.app.locals.db;
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
    res.redirect(`http://localhost:5173/?booking_success=true`);
  } catch (err) {
    console.error("Success Route Error:", err);
    res.redirect(`http://localhost:5173/?booking_error=true`);
  }
});

module.exports = router;
