const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');

// Get booked dates for a hotel
router.get('/hotel/:hotelId/dates', async (req, res) => {
  try {
    const bookings = await Booking.find({
      hotelId: req.params.hotelId,
      status: { $in: ['pending', 'confirmed'] },
      checkOutDate: { $gte: new Date() } // Only return future bookings
    }).select('checkInDate checkOutDate');

    res.json({ success: true, bookedDates: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching booked dates', error: error.message });
  }
});

// Get reservations for the host's own listings (Today tab on HostDashboard)
router.get('/host-reservations', protect, async (req, res) => {
  try {
    const Hotel = require('../models/Hotel');
    // Find all hotels owned by this host
    const hostHotels = await Hotel.find({ hostId: req.user._id }).select('_id');
    const hotelIds = hostHotels.map(h => h._id);

    const reservations = await Booking.find({ hotelId: { $in: hotelIds } })
      .populate('hotelId', 'title images location')
      .populate('userId', 'firstName lastName email')
      .sort({ checkInDate: 1 });

    res.json({ success: true, trips: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching host reservations', error: error.message });
  }
});

// Get user's trips
router.get('/my-trips', protect, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { userId: req.user._id };
    
    if (status && status !== 'undefined' && status !== 'null') {
      if (status === 'cancelled') {
        query.status = 'cancelled';
      } else if (status === 'upcoming') {
        query.status = { $ne: 'cancelled' };
        query.checkInDate = { $gte: new Date() };
      } else if (status === 'past') {
        query.checkOutDate = { $lt: new Date() };
        query.status = { $ne: 'cancelled' };
      }
    }

    const trips = await Booking.find(query)
      .populate('hotelId', 'title image images location price priceRaw pricePerNight rating hostId')
      .sort({ checkInDate: -1 });

    res.json({ 
      success: true, 
      trips 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching trips',
      error: error.message 
    });
  }
});

// Cancel a booking
router.post('/:bookingId/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      userId: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    const checkInDate = new Date(booking.checkInDate);
    const now = new Date();
    const hoursDifference = (checkInDate - now) / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cancellations must be made at least 24 hours before check-in' 
      });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    res.json({ 
      success: true, 
      message: 'Booking cancelled successfully',
      booking 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error cancelling booking',
      error: error.message 
    });
  }
});

// Checkout and payment processing
router.post('/checkout', protect, async (req, res) => {
  try {
    const { hotelId, checkInDate, checkOutDate, guests, totalAmount } = req.body;

    const Stripe = require('stripe');
    const stripeConfig = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_KEY_SECRET;
    
    if (!stripeConfig) {
      return res.status(500).json({ success: false, message: 'Stripe configuration missing' });
    }
    
    if (!totalAmount || isNaN(Number(totalAmount)) || Number(totalAmount) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid booking amount' });
    }

    const stripe = new Stripe(stripeConfig);

    // Fetch hotel name for the Checkout Session line item
    const Hotel = require('../models/Hotel');
    const hotel = await Hotel.findById(hotelId).select('title');
    const hotelTitle = hotel?.title || 'Airbnb Stay';

    // Save booking as pending BEFORE creating session (so we have a bookingId)
    const booking = await Booking.create({
      userId: req.user._id,
      hotelId,
      checkInDate,
      checkOutDate,
      guests,
      totalAmount,
      status: 'pending'
    });

    const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

    // Use Stripe Checkout Session — returns a hosted payment page URL
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: hotelTitle,
              description: `Check-in: ${checkInDate} → Check-out: ${checkOutDate}`,
            },
            unit_amount: Math.round(Number(totalAmount) * 100), // paise
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.user._id.toString(),
        hotelId,
      },
      success_url: `${clientOrigin}/booking-success?bookingId=${booking._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientOrigin}/hotel/${hotelId}`,
    });

    // Store the session id on the booking for later verification
    booking.paymentId = session.id;
    await booking.save();

    res.json({
      success: true,
      url: session.url,           // ← frontend redirects here
      bookingId: booking._id,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error creating booking',
      error: error.message 
    });
  }
});

// Verify payment and confirm booking (called from BookingSuccess page)
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { paymentIntentId: sessionId, bookingId } = req.body;

    if (!sessionId || !bookingId) {
      return res.status(400).json({ success: false, message: 'sessionId and bookingId are required' });
    }

    const Stripe = require('stripe');
    const stripeConfig = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_KEY_SECRET;
    const stripe = new Stripe(stripeConfig);

    // Retrieve the Checkout Session (not a PaymentIntent)
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment not completed yet' 
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        status: 'confirmed',
        paymentId: session.id,
        paidAt: new Date()
      },
      { new: true }
    ).populate('hotelId', 'title location images');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ 
      success: true, 
      message: 'Payment verified and booking confirmed',
      booking 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error verifying payment',
      error: error.message 
    });
  }
});

module.exports = router;
