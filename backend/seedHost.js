require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Hotel = require('./models/Hotel');

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is required");
    process.exit(1);
  }
  await mongoose.connect(uri, { dbName: "hotelsdb" });

  try {
    let host = await User.findOne({ email: 'test@airbnb.com' });
    if (!host) {
      host = new User({
        firstName: 'Demo',
        lastName: 'Host',
        email: 'test@airbnb.com',
        password: 'password123',
        isHost: true
      });
      await host.save();
      console.log('Created Demo Host account');
    } else {
      console.log('Demo Host account already exists');
    }

    const hostImage = "https://a0.muscache.com/im/pictures/user/User-83344331-50e5-4f38-bc06-2d3fb84cdbd7.jpg";

    const result = await Hotel.updateMany(
      { $or: [{ hostId: null }, { hostId: { $exists: false } }] },
      { 
        $set: { 
          hostId: host._id,
          'host.name': 'Demo Host',
          'host.image': hostImage,
          hostName: 'Demo Host'
        } 
      }
    );
    console.log(`Updated ${result.modifiedCount} hotels with Demo Host`);
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
seed();
