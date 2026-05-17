const mongoose = require('mongoose');

/**
 * ListingDocument — stores certification / license files for host listings.
 * These are NEVER exposed via public API. Files live in a private S3 prefix.
 * Admins access them through signed URLs only.
 */
const listingDocumentSchema = new mongoose.Schema({
  listing_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  listing_type: {
    type: String,
    enum: ['experience', 'service'],
    required: true
  },
  file_url: { type: String, required: true }, // S3 key or private URL
  file_type: { type: String },                // MIME type e.g. application/pdf
  original_name: { type: String },            // original filename from user
  label: { type: String, default: 'Document' }, // "License", "Insurance", etc.
  uploaded_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ListingDocument', listingDocumentSchema, 'listing_documents');
