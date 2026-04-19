const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, email, password } = req.body;
    if (!firstName || !lastName || !email || !password || !dateOfBirth) {
      return res.status(400).json({ error: "Please fill in all fields." });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered." });

    const newUser = await User.create({ firstName, lastName, dateOfBirth, email, password });
    const token = jwt.sign({ userId: newUser._id, email: newUser.email }, process.env.JWT_SECRET || "default_secret", { expiresIn: "7d" });
    res.status(201).json({ message: "User registered successfully", token, user: { _id: newUser._id, firstName: newUser.firstName, lastName: newUser.lastName, email: newUser.email } });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Failed to register user." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Please provide email and password." });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials." });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials." });

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || "default_secret", { expiresIn: "7d" });
    res.json({ token, user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Failed to login." });
  }
});

module.exports = router;
