require('dotenv').config();
const mongoose = require('mongoose');

console.log("Trying URI:", process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected!"))
  .catch(err => console.log("❌ Error:", err.message));