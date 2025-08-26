import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import parcelRoutes from "./routes/parcels.js";
// import agentRoutes from "./routes/agents.js";
import adminRoutes from "./routes/admin.js";
// import addressRoutes from "./routes/addresses.js";

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);
app.use(cookieParser());

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/parcels", parcelRoutes);
// app.use("/api/agents", agentRoutes);
app.use("/api/admin", adminRoutes);
// app.use("/api/addresses", addressRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// Socket.IO connection handling

// In your backend Socket.IO connection handler
io.on("connection", (socket) => {
  // console.log(`✅ User connected: ${socket.id}`);

  // Join room for parcel tracking
  socket.on("joinParcel", (trackingNumber, callback) => {
    const roomName = `parcel_${trackingNumber}`;
    // console.log(`📦 Socket ${socket.id} joining room: ${roomName}`);

    socket.join(roomName);

    // Debug: list all rooms this socket is in
    const rooms = Array.from(socket.rooms);
    // console.log(`🏠 Socket ${socket.id} now in rooms:`, rooms);

    if (callback) {
      callback({ success: true, message: `Joined room: ${roomName}` });
    }
  });

  // Leave room
  socket.on("leaveParcel", (trackingNumber) => {
    const roomName = `parcel_${trackingNumber}`;
    // console.log(`📦 Socket ${socket.id} leaving room: ${roomName}`);
    socket.leave(roomName);
  });

  // Debug: log all events
  socket.onAny((event, data) => {
    // console.log(`📡 Socket event from ${socket.id}: ${event}`, data);
  });

  socket.on("disconnect", (reason) => {
    // console.log(`❌ User disconnected: ${socket.id}`, reason);
  });
});
// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

export { app, server };
