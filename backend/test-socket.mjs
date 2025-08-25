// test-socket.mjs
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

console.log("🔌 Testing Socket.IO connection to backend...");

socket.on("connect", () => {
  console.log("✅ Connected to backend");

  // Test joining a parcel room
  socket.emit("joinParcel", "TEST123", (response) => {
    console.log("Join response:", response);
  });
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected");
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error.message);
});

// Listen for any events
socket.onAny((event, data) => {
  console.log("📡 Received event:", event, data);
});

// Test emitting a status update (simulate backend)
setTimeout(() => {
  if (socket.connected) {
    console.log("🧪 Simulating status update from backend...");
    // This is what your backend should emit
    const testUpdate = {
      trackingNumber: "TEST123",
      status: "IN_TRANSIT",
      notes: "Test status update",
      timestamp: new Date().toISOString(),
      latitude: 23.8103,
      longitude: 90.4125,
    };
    // Normally this would come from the backend, but we're simulating
    console.log("Would receive:", testUpdate);
  }
}, 3000);

// Keep connection alive and show status
setInterval(() => {
  console.log("Connection status:", socket.connected ? "✅ Connected" : "❌ Disconnected");
}, 5000);

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Disconnecting...");
  socket.disconnect();
  process.exit(0);
});
