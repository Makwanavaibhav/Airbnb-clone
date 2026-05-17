const express = require('express');
const router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const Experience = require('../models/Experience');
const Service = require('../models/Service');
const ListingDocument = require('../models/ListingDocument');
const Notification = require('../models/Notification');
const User = require('../models/User');

// ─── S3 Setup ─────────────────────────────────────────────────────────────────
let s3;
let publicUpload;   // for listing photos
let privateUpload;  // for certification documents

const PRIVATE_PREFIX = 'listing-docs/';

if (process.env.AWS_ACCESS_KEY_ID) {
  s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  // Public photo upload (same bucket, public-readable prefix)
  publicUpload = multer({
    storage: multerS3({
      s3,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
      key: (req, file, cb) => {
        const ext = file.originalname.split('.').pop() || 'jpg';
        cb(null, `listings/photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);
      }
    }),
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
  });

  // Private document upload (same bucket, PRIVATE_PREFIX — no public-read ACL)
  privateUpload = multer({
    storage: multerS3({
      s3,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
      key: (req, file, cb) => {
        const ext = file.originalname.split('.').pop() || 'pdf';
        cb(null, `${PRIVATE_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);
      }
    }),
    limits: { fileSize: 20 * 1024 * 1024 } // 20 MB
  });
} else {
  // Dev fallback — no real S3
  publicUpload = multer({ storage: multer.memoryStorage() });
  privateUpload = multer({ storage: multer.memoryStorage() });
}

// ─── Helper ───────────────────────────────────────────────────────────────────
const createNotification = async (userId, type, title, message, listing_id = null, listing_type = null) => {
  try {
    await Notification.create({ userId, type, title, message, listing_id, listing_type });
  } catch (err) {
    console.error('Notification create error:', err.message);
  }
};

// ─── HOST: Create Experience listing ─────────────────────────────────────────
// POST /api/listings/experience
router.post('/experience', authenticateToken, publicUpload.array('photos', 20), async (req, res) => {
  try {
    const {
      title, shortDescription, description, category,
      city, location, isRemote, pricePerPerson, duration,
      groupSize, coverImageIndex, availableDays, slotDurationMinutes, slotsStartTime, slotsEndTime, tags
    } = req.body;

    if (!title || !city || !pricePerPerson) {
      return res.status(400).json({ error: 'title, city, and pricePerPerson are required' });
    }

    // Build photo URLs
    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      if (process.env.AWS_ACCESS_KEY_ID) {
        photoUrls = req.files.map(f => f.location);
      } else {
        // Dev mode — placeholder images
        photoUrls = [
          'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80',
          'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'
        ];
      }
    }

    if (photoUrls.length < 3) {
      return res.status(400).json({ error: 'Please upload at least 3 photos' });
    }

    const host = await User.findById(req.user._id).select('firstName lastName');

    const listing = await Experience.create({
      title,
      shortDescription,
      description,
      category: category || 'Experience',
      city,
      location,
      isRemote: isRemote === 'true' || isRemote === true,
      pricePerPerson: parseFloat(pricePerPerson),
      duration: duration || '2 hours',
      groupSize: parseInt(groupSize) || 10,
      images: photoUrls,
      coverImageIndex: parseInt(coverImageIndex) || 0,
      hostId: req.user._id,
      hostName: host ? `${host.firstName} ${host.lastName}` : 'Host',
      availableDays: availableDays ? (Array.isArray(availableDays) ? availableDays : JSON.parse(availableDays)) : [],
      slotDurationMinutes: parseInt(slotDurationMinutes) || null,
      slotsStartTime: slotsStartTime || null,
      slotsEndTime: slotsEndTime || null,
      tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
      listing_status: 'pending_review',
      visibility: false,
      submitted_at: new Date()
    });

    // Notify host
    await createNotification(
      req.user._id,
      'listing_submitted',
      'Listing submitted for review',
      `Your experience "${title}" has been submitted. We'll review it and get back to you within 48 hours.`,
      listing._id,
      'experience'
    );

    // Notify all admins
    const admins = await User.find({ role: 'admin' }).select('_id');
    await Promise.all(admins.map(admin =>
      createNotification(
        admin._id,
        'listing_submitted',
        'New listing pending review',
        `A new experience "${title}" has been submitted for review by ${listing.hostName}.`,
        listing._id,
        'experience'
      )
    ));

    res.status(201).json({ success: true, listing });
  } catch (err) {
    console.error('POST /api/listings/experience error:', err);
    res.status(500).json({ error: 'Failed to create experience listing' });
  }
});

// ─── HOST: Create Service listing ─────────────────────────────────────────────
// POST /api/listings/service
router.post('/service', authenticateToken, publicUpload.array('photos', 20), async (req, res) => {
  try {
    const {
      title, shortDescription, description, serviceType,
      city, location, isRemote, pricePerSession,
      coverImageIndex, availableDays, slotDurationMinutes, slotsStartTime, slotsEndTime, tags
    } = req.body;

    if (!title || !city || !pricePerSession) {
      return res.status(400).json({ error: 'title, city, and pricePerSession are required' });
    }

    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      if (process.env.AWS_ACCESS_KEY_ID) {
        photoUrls = req.files.map(f => f.location);
      } else {
        photoUrls = [
          'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80',
          'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
          'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80'
        ];
      }
    }

    if (photoUrls.length < 3) {
      return res.status(400).json({ error: 'Please upload at least 3 photos' });
    }

    const host = await User.findById(req.user._id).select('firstName lastName');

    const listing = await Service.create({
      title,
      shortDescription,
      description,
      serviceType: serviceType || 'General',
      city,
      location,
      isRemote: isRemote === 'true' || isRemote === true,
      pricePerSession: parseFloat(pricePerSession),
      images: photoUrls,
      coverImageIndex: parseInt(coverImageIndex) || 0,
      hostId: req.user._id,
      hostName: host ? `${host.firstName} ${host.lastName}` : 'Host',
      availableDays: availableDays ? (Array.isArray(availableDays) ? availableDays : JSON.parse(availableDays)) : [],
      slotDurationMinutes: parseInt(slotDurationMinutes) || null,
      slotsStartTime: slotsStartTime || null,
      slotsEndTime: slotsEndTime || null,
      tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
      listing_status: 'pending_review',
      visibility: false,
      submitted_at: new Date()
    });

    await createNotification(
      req.user._id,
      'listing_submitted',
      'Listing submitted for review',
      `Your service "${title}" has been submitted. We'll review it and get back to you within 48 hours.`,
      listing._id,
      'service'
    );

    const admins = await User.find({ role: 'admin' }).select('_id');
    await Promise.all(admins.map(admin =>
      createNotification(
        admin._id,
        'listing_submitted',
        'New listing pending review',
        `A new service "${title}" has been submitted for review by ${listing.hostName}.`,
        listing._id,
        'service'
      )
    ));

    res.status(201).json({ success: true, listing });
  } catch (err) {
    console.error('POST /api/listings/service error:', err);
    res.status(500).json({ error: 'Failed to create service listing' });
  }
});

// ─── HOST: Upload documents for a listing ─────────────────────────────────────
// POST /api/listings/:type/:id/documents
router.post('/:type/:id/documents', authenticateToken, privateUpload.array('documents', 10), async (req, res) => {
  try {
    const { type, id } = req.params;
    if (!['experience', 'service'].includes(type)) {
      return res.status(400).json({ error: 'Invalid listing type' });
    }

    const Model = type === 'experience' ? Experience : Service;
    const listing = await Model.findOne({ _id: id, hostId: req.user._id });
    if (!listing) return res.status(404).json({ error: 'Listing not found or unauthorized' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const labels = req.body.labels ? JSON.parse(req.body.labels) : [];

    const docs = await Promise.all(req.files.map((file, i) => {
      const fileUrl = process.env.AWS_ACCESS_KEY_ID ? file.key : `private-doc-${Date.now()}-${i}`;
      return ListingDocument.create({
        listing_id: id,
        listing_type: type,
        file_url: fileUrl,
        file_type: file.mimetype,
        original_name: file.originalname,
        label: labels[i] || 'Document'
      });
    }));

    res.status(201).json({ success: true, documents: docs });
  } catch (err) {
    console.error('POST /api/listings/:type/:id/documents error:', err);
    res.status(500).json({ error: 'Failed to upload documents' });
  }
});

// ─── HOST: Resubmit a rejected listing ────────────────────────────────────────
// PATCH /api/listings/:type/:id/resubmit
router.patch('/:type/:id/resubmit', authenticateToken, async (req, res) => {
  try {
    const { type, id } = req.params;
    if (!['experience', 'service'].includes(type)) {
      return res.status(400).json({ error: 'Invalid listing type' });
    }

    const Model = type === 'experience' ? Experience : Service;
    const listing = await Model.findOneAndUpdate(
      { _id: id, hostId: req.user._id, listing_status: 'rejected' },
      {
        $set: {
          listing_status: 'pending_review',
          visibility: false,
          rejection_reason: null,
          submitted_at: new Date(),
          reviewed_at: null,
          reviewed_by: null
        }
      },
      { new: true }
    );

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found, not yours, or not in rejected state' });
    }

    // Notify admins
    const admins = await User.find({ role: 'admin' }).select('_id');
    await Promise.all(admins.map(admin =>
      createNotification(
        admin._id,
        'listing_submitted',
        'Listing resubmitted for review',
        `"${listing.title}" has been resubmitted after revision.`,
        listing._id,
        type
      )
    ));

    res.json({ success: true, listing });
  } catch (err) {
    console.error('PATCH resubmit error:', err);
    res.status(500).json({ error: 'Failed to resubmit listing' });
  }
});

// ─── HOST: Get own listings (all statuses) ────────────────────────────────────
// GET /api/listings/host/me?type=experience|service|all
router.get('/host/me', authenticateToken, async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { hostId: req.user._id };

    let experiences = [], services = [];
    if (!type || type === 'experience' || type === 'all') {
      experiences = await Experience.find(filter).sort({ createdAt: -1 });
    }
    if (!type || type === 'service' || type === 'all') {
      services = await Service.find(filter).sort({ createdAt: -1 });
    }

    const combined = [
      ...experiences.map(e => ({ ...e.toObject(), _listingType: 'experience' })),
      ...services.map(s => ({ ...s.toObject(), _listingType: 'service' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, listings: combined });
  } catch (err) {
    console.error('GET /api/listings/host/me error:', err);
    res.status(500).json({ error: 'Failed to fetch host listings' });
  }
});

// ─── ADMIN: List all listings ──────────────────────────────────────────────────
// GET /api/listings/admin?status=pending_review&type=all
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.listing_status = status;

    let experiences = [], services = [];

    if (!type || type === 'experience' || type === 'all') {
      const eFilter = { ...filter };
      experiences = await Experience.find(eFilter)
        .populate('hostId', 'firstName lastName email profilePhoto')
        .populate('reviewed_by', 'firstName lastName')
        .sort({ submitted_at: -1, createdAt: -1 });
    }

    if (!type || type === 'service' || type === 'all') {
      const sFilter = { ...filter };
      services = await Service.find(sFilter)
        .populate('hostId', 'firstName lastName email profilePhoto')
        .populate('reviewed_by', 'firstName lastName')
        .sort({ submitted_at: -1, createdAt: -1 });
    }

    const combined = [
      ...experiences.map(e => ({ ...e.toObject(), _listingType: 'experience' })),
      ...services.map(s => ({ ...s.toObject(), _listingType: 'service' }))
    ].sort((a, b) => {
      // pending_review first
      const order = { pending_review: 0, active: 1, rejected: 2, draft: 3 };
      return (order[a.listing_status] ?? 9) - (order[b.listing_status] ?? 9);
    });

    res.json({ success: true, listings: combined, total: combined.length });
  } catch (err) {
    console.error('GET /api/listings/admin error:', err);
    res.status(500).json({ error: 'Failed to fetch admin listings' });
  }
});

// ─── ADMIN: Get single listing detail ─────────────────────────────────────────
// GET /api/listings/admin/:type/:id
router.get('/admin/:type/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    if (!['experience', 'service'].includes(type)) {
      return res.status(400).json({ error: 'Invalid listing type' });
    }

    const Model = type === 'experience' ? Experience : Service;
    const listing = await Model.findById(id)
      .populate('hostId', 'firstName lastName email profilePhoto createdAt')
      .populate('reviewed_by', 'firstName lastName');

    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    // Fetch associated documents
    const docs = await ListingDocument.find({ listing_id: id, listing_type: type });

    // Generate signed URLs for each document (15 min expiry)
    const docsWithUrls = await Promise.all(docs.map(async (doc) => {
      let signedUrl = null;
      if (s3 && process.env.AWS_ACCESS_KEY_ID) {
        try {
          const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: doc.file_url
          });
          signedUrl = await getSignedUrl(s3, command, { expiresIn: 900 }); // 15 min
        } catch (e) {
          console.error('Signed URL error:', e.message);
          signedUrl = null;
        }
      } else {
        signedUrl = `[DEV MODE — no S3] ${doc.file_url}`;
      }
      return { ...doc.toObject(), signedUrl };
    }));

    res.json({ success: true, listing, documents: docsWithUrls });
  } catch (err) {
    console.error('GET /api/listings/admin/:type/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch listing detail' });
  }
});

// ─── ADMIN: Approve listing ────────────────────────────────────────────────────
// PATCH /api/listings/admin/:type/:id/approve
router.patch('/admin/:type/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    if (!['experience', 'service'].includes(type)) {
      return res.status(400).json({ error: 'Invalid listing type' });
    }

    const Model = type === 'experience' ? Experience : Service;
    const listing = await Model.findByIdAndUpdate(
      id,
      {
        $set: {
          listing_status: 'active',
          visibility: true,
          rejection_reason: null,
          reviewed_at: new Date(),
          reviewed_by: req.user._id
        }
      },
      { new: true }
    );

    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    // Notify the host
    await createNotification(
      listing.hostId,
      'listing_approved',
      '🎉 Your listing is live!',
      `Your ${type} "${listing.title}" has been approved and is now visible to guests.`,
      listing._id,
      type
    );

    res.json({ success: true, listing });
  } catch (err) {
    console.error('PATCH approve error:', err);
    res.status(500).json({ error: 'Failed to approve listing' });
  }
});

// ─── ADMIN: Reject listing ─────────────────────────────────────────────────────
// PATCH /api/listings/admin/:type/:id/reject
router.patch('/admin/:type/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { rejection_reason } = req.body;

    if (!['experience', 'service'].includes(type)) {
      return res.status(400).json({ error: 'Invalid listing type' });
    }

    if (!rejection_reason || !rejection_reason.trim()) {
      return res.status(400).json({ error: 'rejection_reason is required' });
    }

    const Model = type === 'experience' ? Experience : Service;
    const listing = await Model.findByIdAndUpdate(
      id,
      {
        $set: {
          listing_status: 'rejected',
          visibility: false,
          rejection_reason: rejection_reason.trim(),
          reviewed_at: new Date(),
          reviewed_by: req.user._id
        }
      },
      { new: true }
    );

    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    await createNotification(
      listing.hostId,
      'listing_rejected',
      'Your listing needs changes',
      `Your ${type} "${listing.title}" was not approved. Reason: ${rejection_reason.trim()}. You can edit and resubmit.`,
      listing._id,
      type
    );

    res.json({ success: true, listing });
  } catch (err) {
    console.error('PATCH reject error:', err);
    res.status(500).json({ error: 'Failed to reject listing' });
  }
});

// ─── NOTIFICATIONS: Get for logged-in user ────────────────────────────────────
// GET /api/listings/notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ success: true, notifications: notifs, unreadCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/listings/notifications/read-all
router.patch('/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

module.exports = router;
