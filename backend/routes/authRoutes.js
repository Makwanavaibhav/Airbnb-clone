const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const db = req.app.locals.db;
  try {
    const { firstName, lastName, dateOfBirth, email, password } = req.body;
    if (!firstName || !lastName || !email || !password || !dateOfBirth) {
      return res.status(400).json({ error: "Please fill in all fields." });
    }
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.collection("users").insertOne({
      firstName, lastName, dateOfBirth, email, password: hashedPassword, createdAt: new Date()
    });
    res.status(201).json({ message: "User registered successfully", userId: result.insertedId });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Failed to register user." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const db = req.app.locals.db;
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Please provide email and password." });

    const user = await db.collection("users").findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials." });

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || "default_secret", { expiresIn: "7d" });
    res.json({ token, user: { firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Failed to login." });
  }
});

module.exports = router;
