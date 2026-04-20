/**
 * Migration: set status='published' on all existing hotel documents that
 * currently have no status field (i.e., hotels seeded before this feature was added).
 *
 * Run once:  node backend/scripts/migrateHotelStatus.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('❌  MONGO_URI not found in environment. Check backend/.env');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅  Connected to MongoDB');

    const result = await mongoose.connection.db
      .collection('hotels')
      .updateMany(
        { status: { $exists: false } }, // only touch documents without status
        { $set: { status: 'published' } }
      );

    console.log(`✅  Updated ${result.modifiedCount} hotel(s) → status: 'published'`);
  } catch (err) {
    console.error('❌  Migration failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌  Disconnected');
  }
})();
