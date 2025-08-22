// utils/tokenBlacklist.js
import jwt from "jsonwebtoken";
const tokenBlacklist = new Set();

export const addToBlacklist = (token) => {
  // Add token to blacklist with expiration time
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const expiresAt = decoded.exp * 1000; // Convert to milliseconds
  tokenBlacklist.add(token);

  // Automatically remove from blacklist after expiration
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, expiresAt - Date.now());
};

export const isBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

// In your auth middleware
export const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    // Check if token is blacklisted
    if (isBlacklisted(token)) {
      return res.status(401).json({ error: "Token has been invalidated." });
    }

    // ... rest of your authentication logic
  } catch (error) {
    // ... error handling
  }
};
