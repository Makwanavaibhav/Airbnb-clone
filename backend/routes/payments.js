const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/authMiddleware');
const Experience = require('../models/Experience');
const Service = require('../models/Service');
const ExperienceBooking = require('../models/ExperienceBooking');
const ServiceBooking = require('../models/ServiceBooking');

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY is missing from backend .env");
}

// ──────────────────────────────────────────────────────────────────
// ROUTE 1: Experience Payment Intent
// ──────────────────────────────────────────────────────────────────
router.post('/experience/create-intent', protect, async (req, res) => {
  try {
    const { experienceId, checkIn, checkOut, guests } = req.body;

    if (!experienceId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const exp = await Experience.findById(experienceId);
    if (!exp) return res.status(404).json({ success: false, message: 'Experience not found' });

    // Validate dates
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date provided' });
    }
    if (inDate < today) {
      return res.status(400).json({ success: false, message: 'Check-in date cannot be in the past' });
    }
    if (outDate <= inDate) {
      return res.status(400).json({ success: false, message: 'Check-out must be after check-in' });
    }

    const numGuests = Number(guests);
    if (numGuests < 1) {
      return res.status(400).json({ success: false, message: 'At least 1 guest required' });
    }
    if (exp.groupSize && numGuests > exp.groupSize) {
      return res.status(400).json({ success: false, message: `Exceeds maximum guest limit of ${exp.groupSize}` });
    }

    // Prevent double booking for the same experience date
    const overlap = await ExperienceBooking.findOne({
      experienceId,
      checkIn: inDate,
      status: { $in: ['pending', 'confirmed'] }
    });
    if (overlap) {
      return res.status(409).json({ success: false, message: 'This experience slot is already fully booked' });
    }

    // Calculations
    const nights = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
    const subtotal = exp.pricePerPerson * numGuests * nights;
    const serviceFee = Math.round(subtotal * 0.12);
    const total = subtotal + serviceFee;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total * 100, // Stripe uses paise/cents
      currency: 'inr',
      metadata: {
        experienceId: experienceId.toString(),
        userId: req.user.id.toString(),
        checkIn: inDate.toISOString(),
        checkOut: outDate.toISOString(),
        guests: numGuests.toString()
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      total,
      subtotal,
      serviceFee,
      nights
    });
  } catch (error) {
    console.error('Experience Intent Error:', error);
    res.status(500).json({ success: false, message: 'Payment initiation failed', error: error.message });
  }
});

// ──────────────────────────────────────────────────────────────────
// ROUTE 2: Service Payment Intent
// ──────────────────────────────────────────────────────────────────
router.post('/service/create-intent', protect, async (req, res) => {
  try {
    const { serviceId, sessionDate } = req.body;

    if (!serviceId || !sessionDate) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const svc = await Service.findById(serviceId);
    if (!svc) return res.status(404).json({ success: false, message: 'Service not found' });

    // Validate dates
    const sDate = new Date(sessionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);

    if (isNaN(sDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid session date' });
    }
    if (sDate < today) {
      return res.status(400).json({ success: false, message: 'Session date cannot be in the past' });
    }
    if (sDate > maxDate) {
      return res.status(400).json({ success: false, message: 'Cannot book more than 1 year in advance' });
    }

    // Prevent double booking for the same service session
    const overlap = await ServiceBooking.findOne({
      serviceId,
      sessionDate: sDate,
      status: { $in: ['pending', 'confirmed'] }
    });
    if (overlap) {
      return res.status(409).json({ success: false, message: 'This service session is already booked' });
    }

    // Calculations
    const serviceFee = Math.round(svc.pricePerSession * 0.12);
    const total = svc.pricePerSession + serviceFee;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total * 100, // Stripe uses paise/cents
      currency: 'inr',
      metadata: {
        serviceId: serviceId.toString(),
        userId: req.user.id.toString(),
        sessionDate: sDate.toISOString()
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      total,
      basePrice: svc.pricePerSession,
      serviceFee
    });
  } catch (error) {
    console.error('Service Intent Error:', error);
    res.status(500).json({ success: false, message: 'Payment initiation failed', error: error.message });
  }
});

// ──────────────────────────────────────────────────────────────────
// ROUTE 3: Confirm Booking
// ──────────────────────────────────────────────────────────────────
router.post('/confirm-booking', protect, async (req, res) => {
  try {
    const { paymentIntentId, bookingType } = req.body;

    if (!paymentIntentId || !bookingType) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status !== 'succeeded') {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }

    let newBooking;

    if (bookingType === 'experience') {
      const exists = await ExperienceBooking.findOne({ paymentIntentId });
      if (exists) return res.status(409).json({ success: false, message: 'Booking already confirmed' });

      // Create new booking from metadata
      const { experienceId, checkIn, checkOut, guests } = intent.metadata;
      
      const exp = await Experience.findById(experienceId);
      if (!exp) return res.status(404).json({ success: false, message: 'Experience not found' });

      newBooking = await ExperienceBooking.create({
        userId: req.user.id,
        experienceId,
        hostId: exp.hostId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests: Number(guests),
        totalPrice: intent.amount / 100,
        status: 'confirmed',
        paymentIntentId
      });
    } else if (bookingType === 'service') {
      const exists = await ServiceBooking.findOne({ paymentIntentId });
      if (exists) return res.status(409).json({ success: false, message: 'Booking already confirmed' });

      // Create new booking from metadata
      const { serviceId, sessionDate } = intent.metadata;

      const svc = await Service.findById(serviceId);
      if (!svc) return res.status(404).json({ success: false, message: 'Service not found' });

      newBooking = await ServiceBooking.create({
        userId: req.user.id,
        serviceId,
        hostId: svc.hostId,
        sessionDate: new Date(sessionDate),
        totalPrice: intent.amount / 100,
        status: 'confirmed',
        paymentIntentId
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid booking type' });
    }

    res.json({ success: true, bookingId: newBooking._id });
  } catch (error) {
    console.error('Confirm Booking Error:', error);
    res.status(500).json({ success: false, message: 'Failed to confirm booking', error: error.message });
  }
});

module.exports = router;
