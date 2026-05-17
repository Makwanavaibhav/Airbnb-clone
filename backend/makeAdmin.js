require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const email = process.argv[2];

if (!email) {
  console.error("Please provide the email of the user you want to make an admin.");
  console.error("Usage: node makeAdmin.js <user-email>");
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/airbnb-clone")
.then(async () => {
  const user = await User.findOneAndUpdate(
    { email: email },
    { $set: { role: 'admin' } },
    { new: true }
  );

  if (!user) {
    console.log(`❌ User with email "${email}" not found.`);
  } else {
    console.log(`✅ Success! User ${user.firstName} ${user.lastName} (${user.email}) is now an ADMIN.`);
  }
  process.exit(0);
})
.catch(err => {
  console.error("Database connection error:", err);
  process.exit(1);
});
