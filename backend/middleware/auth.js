import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { unauthorizedResponse } from "../utils/response.js";
import { isBlacklisted } from "../utils/tokenBlacklist.js";

const prisma = new PrismaClient();

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return unauthorizedResponse(res, "Access denied. No token provided.");
    }

    // Check if token is blacklisted
    if (isBlacklisted(token)) {
      return unauthorizedResponse(res, "Token has been revoked. Please login again.");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      return unauthorizedResponse(res, "User not found.");
    }

    if (!user.isActive) {
      return unauthorizedResponse(res, "Account is deactivated.");
    }

    // Optional: Check if email is verified
    if (!user.isEmailVerified && req.originalUrl !== "/api/auth/resend-verification") {
      return unauthorizedResponse(res, "Please verify your email address.");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);

    // Specific error handling
    if (error.name === "TokenExpiredError") {
      return unauthorizedResponse(res, "Token expired. Please login again.");
    }

    if (error.name === "JsonWebTokenError") {
      return unauthorizedResponse(res, "Invalid token.");
    }

    if (error.name === "NotBeforeError") {
      return unauthorizedResponse(res, "Token not active.");
    }

    return unauthorizedResponse(res, "Authentication failed.");
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorizedResponse(res, "Access denied. Authentication required.");
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions.",
        error: "You don't have permission to access this resource.",
      });
    }

    next();
  };
};
