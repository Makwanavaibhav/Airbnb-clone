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
const experienceRoutes = require("./routes/experienceRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const listingRoutes = require("./routes/listingRoutes");

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
app.use("/api/experiences", experienceRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/search", require("./routes/search"));
app.use("/api/listings", listingRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ─── Socket.io ───────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_room', async (roomId) => {
    try {
      let authorized = false;
      const parts = roomId.split('_');
      
      if (parts[0] === 'dm' && parts.length === 3) {
        // Format: dm_{userId1}_{userId2}
        const id1 = parts[1];
        const id2 = parts[2];
        if (String(socket.userId) === String(id1) || String(socket.userId) === String(id2)) {
          authorized = true;
        }
      } else if (parts.length >= 3) {
        // Legacy format: hotelId_guestId_hostId
        const guestId = parts[1];
        const hostId = parts[2];
        if (String(socket.userId) === String(guestId) || String(socket.userId) === String(hostId)) {
          authorized = true;
        }
      } else {
        // Fallback check: look at messages in this room
        const Message = require('./models/Message');
        const msg = await Message.findOne({ conversationId: roomId });
        // If no messages exist yet, or the user is the sender/receiver, allow join
        if (!msg || String(msg.senderId) === String(socket.userId) || String(msg.receiverId) === String(socket.userId)) {
          authorized = true;
        }
      }

      if (!authorized) {
        console.log(`Unauthorized join attempt by ${socket.userId} for room ${roomId}`);
        return;
      }

      socket.join(roomId);
      console.log(`User ${socket.userId} joined room: ${roomId}`);
    } catch (err) {
      console.error("Error joining conversation:", err);
    }
  });

  socket.on('send_message', async (data) => {
    const { roomId, conversationId, receiverId, message } = data;
    const finalConversationId = roomId || conversationId;

    // ── Use socket.userId (set from verified JWT) as authoritative sender.
    // Never trust the client-supplied senderId — ID format mismatches would
    // silently drop every message if we compare them with strict equality.
    const senderId = String(socket.userId);

    if (!senderId) {
      socket.emit('message_error', { error: 'Not authenticated' });
      return;
    }

    if (!message || !String(message).trim()) {
      return;
    }

    if (!finalConversationId || !receiverId) {
      socket.emit('message_error', { error: 'Missing conversationId or receiverId' });
      return;
    }

    try {
      const Message = require('./models/Message');
      const Notification = require('./models/Notification');
      const User = require('./models/User');
      
      const newMessage = await Message.create({
        conversationId: finalConversationId,
        senderId,
        receiverId,
        message,
        timestamp: new Date()
      });

      // Fetch sender name for notification
      const sender = await User.findById(senderId).select('firstName lastName');
      const senderName = sender ? `${sender.firstName} ${sender.lastName}` : 'Someone';

      // Create a notification for the receiver
      await Notification.create({
        userId: receiverId,
        type: 'new_message',
        title: `New message from ${senderName}`,
        message: message.length > 50 ? message.substring(0, 47) + '...' : message
      });

      // Ensure sender is also in the room (handles reconnect edge-cases)
      socket.join(finalConversationId);

      // Broadcast to everyone in the room INCLUDING the sender so they
      // see the DB-saved message with the real _id, senderId, and timestamp.
      io.to(finalConversationId).emit('receive_message', newMessage);
    } catch (err) {
      console.error('send_message error:', err);
      socket.emit('message_error', { error: 'Failed to save message. Please try again.' });
    }
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
