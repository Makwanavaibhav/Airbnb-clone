const express = require('express');
const router = express.Router();
const Experience = require('../models/Experience');

// GET /api/experiences?city=Goa
// PUBLIC — only returns active & visible listings (or legacy seeded records without listing_status)
router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    let query = {
      // Allow records where listing_status is 'active' OR field doesn't exist yet (legacy seeded data)
      $or: [
        { listing_status: 'active', visibility: true },
        { listing_status: { $exists: false } }
      ]
    };
    if (city && city.toLowerCase() !== 'anywhere' && city.toLowerCase() !== 'nearby') {
      query.city = { $regex: city, $options: 'i' };
    }
    const experiences = await Experience.find(query).sort({ rating: -1 });
    res.json(experiences);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/experiences/:id
router.get('/:id', async (req, res) => {
  try {
    const exp = await Experience.findById(req.params.id).populate('hostId', 'firstName lastName');
    if (!exp) return res.status(404).json({ success: false, message: 'Experience not found' });
    res.json(exp);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
