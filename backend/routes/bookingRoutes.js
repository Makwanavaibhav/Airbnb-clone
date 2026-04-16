const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');

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
      }
    }

    const trips = await Booking.find(query)
      .populate('hotelId', 'title images location price rating')
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
    
    if(!stripeConfig) {
      return res.status(500).json({ success: false, message: 'Stripe configuration missing' });
    }
    
    const stripe = new Stripe(stripeConfig);

    // Assuming we use PaymentIntents for Indian regulations or standard setup
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Amount in smallest unit
      currency: 'inr',
      metadata: {
        hotelId,
        userId: req.user._id.toString(),
        checkInDate,
        checkOutDate,
        guests
      }
    });

    const booking = await Booking.create({
      userId: req.user._id,
      hotelId,
      checkInDate,
      checkOutDate,
      guests,
      totalAmount,
      paymentId: paymentIntent.id,
      status: 'pending'
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      bookingId: booking._id
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error creating booking',
      error: error.message 
    });
  }
});

// Verify payment and confirm booking
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { 
      paymentIntentId,
      bookingId 
    } = req.body;

    const Stripe = require('stripe');
    const stripeConfig = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_KEY_SECRET;
    const stripe = new Stripe(stripeConfig);
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment not successful yet' 
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        status: 'confirmed',
        paymentId: paymentIntent.id,
        paidAt: new Date()
      },
      { new: true }
    ).populate('hotelId');

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
