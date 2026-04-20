const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const Experience = require('../models/Experience');
const Service = require('../models/Service');

// GET /api/search/destinations?q=query
router.get('/destinations', async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || query.trim() === '') {
      // Return all distinct cities — only from published hotels
      const allCities = [
        ...await Hotel.distinct('city', { status: 'published' }),
        ...await Experience.distinct('city'),
        ...await Service.distinct('city')
      ];

      const unique = [...new Set(
        allCities.filter(Boolean).map(c => c.trim())
      )].sort();

      // Get count
      const withCounts = await Promise.all(unique.map(async (city) => {
        // use case insensitive regex for count to be accurate
        const regexStr = `^${city.replace(/[.*+?^$/{}()|[\]\\]/g, '\\$&')}$`;
        const regex = new RegExp(regexStr, 'i');
        const [h, e, s] = await Promise.all([
          Hotel.countDocuments({ city: regex, status: 'published' }),
          Experience.countDocuments({ city: regex }),
          Service.countDocuments({ city: regex })
        ]);
        return { city, count: h + e + s };
      }));

      return res.json({ destinations: withCounts });
    }

    // Build regex for partial matches
    const safeQ = query.trim().replace(/[.*+?^$/{}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(safeQ, 'i');

    const [hotelCities, expCities, svcCities] = await Promise.all([
      Hotel.distinct('city', { city: regex, status: 'published' }),
      Experience.distinct('city', { city: regex }),
      Service.distinct('city', { city: regex })
    ]);

    const results = [...new Set([
      ...hotelCities, ...expCities, ...svcCities
    ].filter(Boolean).map(c => c.trim()))].sort();

    const withCounts = await Promise.all(results.map(async (city) => {
        const exactRegexStr = `^${city.replace(/[.*+?^$/{}()|[\]\\]/g, '\\$&')}$`;
        const exactRegex = new RegExp(exactRegexStr, 'i');
        const [h, e, s] = await Promise.all([
          Hotel.countDocuments({ city: exactRegex, status: 'published' }),
          Experience.countDocuments({ city: exactRegex }),
          Service.countDocuments({ city: exactRegex })
        ]);
        return { city, count: h + e + s };
    }));

    return res.json({ destinations: withCounts.slice(0, 10) }); // Limit to 10 max
  } catch (err) {
    console.error('Search Route Error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching destinations' });
  }
});

module.exports = router;
