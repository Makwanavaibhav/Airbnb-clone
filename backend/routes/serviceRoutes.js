const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// GET /api/services?city=Goa
// PUBLIC — only returns active & visible listings (or legacy seeded records without listing_status)
router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    let query = {
      $or: [
        { listing_status: 'active', visibility: true },
        { listing_status: { $exists: false } }
      ]
    };
    if (city && city.toLowerCase() !== 'anywhere' && city.toLowerCase() !== 'nearby') {
      query.city = { $regex: city, $options: 'i' };
    }
    const services = await Service.find(query).sort({ rating: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/services/:id
router.get('/:id', async (req, res) => {
  try {
    const svc = await Service.findById(req.params.id).populate('hostId', 'firstName lastName');
    if (!svc) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json(svc);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
