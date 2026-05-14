const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const ExperienceBooking = require('../models/ExperienceBooking');
const ServiceBooking = require('../models/ServiceBooking');
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

// Get user's trips (merged: hotels + experiences + services)
router.get('/my-trips', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Hotel bookings
    const hotelBookings = await Booking.find({ userId })
      .populate('hotelId', 'title image images location price priceRaw pricePerNight rating hostId')
      .sort({ checkInDate: -1 })
      .lean();
    const normalizedHotels = hotelBookings.map(b => ({
      ...b,
      bookingType: 'hotel',
      title: b.hotelId?.title,
      city: b.hotelId?.location,
      images: b.hotelId?.images || (b.hotelId?.image ? [b.hotelId.image] : []),
      totalPrice: b.totalAmount,
      startDate: b.checkInDate,
      endDate: b.checkOutDate,
    }));

    // Experience bookings
    const expBookings = await ExperienceBooking.find({ userId })
      .populate('experienceId', 'title images city pricePerPerson')
      .sort({ checkIn: -1 })
      .lean();
    const normalizedExp = expBookings.map(b => ({
      ...b,
      bookingType: 'experience',
      title: b.experienceId?.title,
      city: b.experienceId?.city,
      images: b.experienceId?.images || [],
      totalPrice: b.totalPrice,
      startDate: b.checkIn,
      endDate: b.checkOut,
    }));

    // Service bookings
    const svcBookings = await ServiceBooking.find({ userId })
      .populate('serviceId', 'title images city pricePerSession')
      .sort({ sessionDate: -1 })
      .lean();
    const normalizedSvc = svcBookings.map(b => ({
      ...b,
      bookingType: 'service',
      title: b.serviceId?.title,
      city: b.serviceId?.city,
      images: b.serviceId?.images || [],
      totalPrice: b.totalPrice,
      startDate: b.sessionDate,
      endDate: b.sessionDate,
    }));

    // Merge & sort by creation date descending
    const allTrips = [...normalizedHotels, ...normalizedExp, ...normalizedSvc]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, trips: allTrips });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching trips',
      error: error.message 
    });
  }
});

// POST /api/bookings/experience – Create experience booking
router.post('/experience', protect, async (req, res) => {
  try {
    const { experienceId, hostId, checkIn, checkOut, guests, totalPrice } = req.body;
    if (!experienceId || !checkIn || !guests || !totalPrice) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const booking = await ExperienceBooking.create({
      userId: req.user._id,
      experienceId,
      hostId,
      checkIn: new Date(checkIn),
      checkOut: checkOut ? new Date(checkOut) : undefined,
      guests,
      totalPrice,
      status: 'confirmed',
      bookingType: 'experience',
    });
    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating experience booking', error: error.message });
  }
});

// POST /api/bookings/service – Create service booking
router.post('/service', protect, async (req, res) => {
  try {
    const { serviceId, hostId, sessionDate, totalPrice } = req.body;
    if (!serviceId || !sessionDate || !totalPrice) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const booking = await ServiceBooking.create({
      userId: req.user._id,
      serviceId,
      hostId,
      sessionDate: new Date(sessionDate),
      totalPrice,
      status: 'confirmed',
      bookingType: 'service',
    });
    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating service booking', error: error.message });
  }
});

// Cancel a booking
router.post('/:bookingId/cancel', protect, async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const userId = req.user._id;

    let booking = await Booking.findOne({ _id: bookingId, userId });
    let modelType = 'Hotel';

    if (!booking) {
      booking = await ExperienceBooking.findOne({ _id: bookingId, userId });
      if (booking) modelType = 'Experience';
    }
    if (!booking) {
      booking = await ServiceBooking.findOne({ _id: bookingId, userId });
      if (booking) modelType = 'Service';
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const Hotel = require('../models/Hotel');
    const Experience = require('../models/Experience');
    const Service = require('../models/Service');
    const Message = require('../models/Message');

    let policy = 'Flexible';
    let checkInDate;
    let hostId;
    let title = 'your listing';

    if (modelType === 'Hotel') {
      checkInDate = new Date(booking.checkInDate);
      const hotel = await Hotel.findById(booking.hotelId).select('cancellationPolicy hostId title');
      if (hotel) {
        policy = hotel.cancellationPolicy || 'Flexible';
        hostId = hotel.hostId;
        title = hotel.title;
      }
    } else if (modelType === 'Experience') {
      checkInDate = new Date(booking.checkIn);
      const exp = await Experience.findById(booking.experienceId).select('cancellationPolicy hostId title');
      if (exp) {
        policy = exp.cancellationPolicy || 'Flexible';
        hostId = exp.hostId;
        title = exp.title;
      }
    } else {
      checkInDate = new Date(booking.sessionDate);
      const svc = await Service.findById(booking.serviceId).select('cancellationPolicy hostId title');
      if (svc) {
        policy = svc.cancellationPolicy || 'Flexible';
        hostId = svc.hostId;
        title = svc.title;
      }
    }

    const now = new Date();
    const hoursDifference = (checkInDate - now) / (1000 * 60 * 60);

    let requiredHours = 24;
    if (policy === 'Moderate') requiredHours = 120; // 5 days
    if (policy === 'Strict') requiredHours = 336; // 14 days

    if (hoursDifference < requiredHours) {
      return res.status(400).json({ 
        success: false, 
        message: `Under the ${policy} policy, cancellations must be made at least ${requiredHours} hours before check-in.` 
      });
    }

    // Process Stripe Refund if paid
    if (booking.paymentId || booking.paymentIntentId) {
      const Stripe = require('stripe');
      const stripeConfig = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_KEY_SECRET;
      if (stripeConfig) {
        const stripe = new Stripe(stripeConfig);
        try {
          const paymentId = booking.paymentId || booking.paymentIntentId;
          let paymentIntentIdToRefund = paymentId;
          
          if (modelType === 'Hotel') {
            const session = await stripe.checkout.sessions.retrieve(paymentId);
            paymentIntentIdToRefund = session.payment_intent;
          }
          
          if (paymentIntentIdToRefund) {
            await stripe.refunds.create({
              payment_intent: paymentIntentIdToRefund,
            });
          }
        } catch (refundError) {
          console.error("Refund failed:", refundError);
          return res.status(500).json({ success: false, message: 'Cancellation failed during refund processing.', error: refundError.message });
        }
      }
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    // Notify Host via Message
    if (hostId && hostId.toString() !== userId.toString()) {
      const ids = [userId.toString(), hostId.toString()].sort();
      const conversationId = `${ids[0]}_${ids[1]}`;
      await Message.create({
        conversationId,
        senderId: userId,
        receiverId: hostId,
        message: `System: I have cancelled my booking for ${title}. The slot is now free.`,
        read: false
      });
    }

    res.json({ 
      success: true, 
      message: 'Booking cancelled successfully and fully refunded.',
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

// Delete a pending booking permanently
router.delete('/:bookingId', protect, async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({
      _id: req.params.bookingId,
      userId: req.user._id,
      status: 'pending'
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pending booking not found or unauthorized' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Booking removed successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting booking',
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

    // Fetch hotel — validate it exists and is published before accepting payment
    const Hotel = require('../models/Hotel');
    const hotel = await Hotel.findById(hotelId).select('title status');
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    if (hotel.status !== 'published') {
      return res.status(403).json({ success: false, message: 'This listing is not available for booking.' });
    }
    const hotelTitle = hotel.title || 'Airbnb Stay';

    // Prevent overlapping active bookings for the same hotel
    const overlap = await Booking.findOne({
      hotelId,
      status: { $in: ['pending', 'confirmed'] },
      checkInDate: { $lt: new Date(checkOutDate) },
      checkOutDate: { $gt: new Date(checkInDate) }
    }).select('_id');

    if (overlap) {
      return res.status(409).json({
        success: false,
        message: 'Selected dates are no longer available'
      });
    }

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

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure only the booking owner can confirm this payment
    if (String(booking.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized for this booking' });
    }

    // Ensure Stripe session belongs to this booking/user
    const metadataBookingId = session?.metadata?.bookingId;
    const metadataUserId = session?.metadata?.userId;
    if (
      metadataBookingId !== String(booking._id) ||
      metadataUserId !== String(req.user._id)
    ) {
      return res.status(400).json({ success: false, message: 'Payment session does not match booking' });
    }

    // Ensure this is the session created for this booking
    if (booking.paymentId && booking.paymentId !== session.id) {
      return res.status(400).json({ success: false, message: 'Invalid payment session for booking' });
    }

    booking.status = 'confirmed';
    booking.paymentId = session.id;
    booking.paidAt = new Date();
    await booking.save();
    await booking.populate('hotelId', 'title location images');

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
