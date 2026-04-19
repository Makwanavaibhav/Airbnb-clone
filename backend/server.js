require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

const authRoutes = require("./routes/authRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.use((socket, next) => {
  const token = socket.handshake?.auth?.token;
  if (!token) return next(new Error("Authentication required"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    socket.userId = decoded.userId || decoded._id;
    return next();
  } catch {
    return next(new Error("Invalid token"));
  }
});

const PORT = process.env.PORT || 5001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173" })); // Vite dev server
app.use(express.json());

// ─── MongoDB Connection ───────────────────────────────────────────────────────
let db;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌  MONGODB_URI is not set in .env");
    process.exit(1);
  }
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  db = client.db("hotelsdb");
  
  // Connect Mongoose as well for new models
  await mongoose.connect(uri, { dbName: "hotelsdb" });
  
  // Make db accessible in routes via req.app.locals.db
  app.locals.db = db;
  
  console.log("✅  Connected to MongoDB Atlas (hotelsdb)");
}

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", require("./routes/messageRoutes"));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ─── Socket.io ───────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_conversation', async (conversationId) => {
    try {
      let authorized = false;
      const parts = conversationId.split('_');
      
      if (parts.length >= 3) {
        const guestId = parts[1];
        const hostId = parts[2];
        if (String(socket.userId) === String(guestId) || String(socket.userId) === String(hostId)) {
          authorized = true;
        }
      } else {
        // Fallback check: look at messages in this conversation
        const Message = require('./models/Message');
        const msg = await Message.findOne({ conversationId });
        // If no messages exist yet, or the user is the sender/receiver, allow join
        if (!msg || String(msg.senderId) === String(socket.userId) || String(msg.receiverId) === String(socket.userId)) {
          authorized = true;
        }
      }

      if (!authorized) {
        console.log(`Unauthorized join attempt by ${socket.userId} for room ${conversationId}`);
        return;
      }

      socket.join(conversationId);
      console.log(`User joined conversation: ${conversationId}`);
    } catch (err) {
      console.error("Error joining conversation:", err);
    }
  });

  socket.on('send_message', async (data) => {
    const { conversationId, senderId, receiverId, message } = data;
    if (!socket.userId || String(socket.userId) !== String(senderId)) {
      return;
    }

    if (!message || !String(message).trim()) {
      return;
    }

    const Message = require('./models/Message');
    const newMessage = await Message.create({
      conversationId,
      senderId,
      receiverId,
      message,
      timestamp: new Date()
    });

    io.to(conversationId).emit('receive_message', newMessage);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────
connectDB()
  .then(() => {
    server.listen(PORT, () => console.log(`🚀  API running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌  DB connection failed:", err.message);
    process.exit(1);
  });
