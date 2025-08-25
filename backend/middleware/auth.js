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

export const authorizeParcelAccess = async (req, res, next) => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const parcelId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const parcel = await prisma.parcel.findUnique({
      where: { id: parcelId },
      select: {
        id: true,
        customerId: true,
        agentId: true,
      },
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel not found",
      });
    }

    let hasAccess = false;

    switch (userRole) {
      case "ADMIN":
        hasAccess = true; // Admins can access all parcels
        break;
      case "CUSTOMER":
        hasAccess = parcel.customerId === userId;
        break;
      case "AGENT":
        hasAccess = parcel.agentId === userId || parcel.customerId === userId;
        break;
      default:
        hasAccess = false;
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied for this parcel",
      });
    }

    // Add parcel info to request for use in controller
    req.parcel = parcel;
    next();
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(500).json({
      success: false,
      message: "Authorization check failed",
    });
  }
};

/**
 * Check if agent can update parcel status
 * Only assigned agents can update status (plus admins)
 */
export const authorizeStatusUpdate = async (req, res, next) => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const parcelId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === "ADMIN") {
      return next(); // Admins can update any parcel status
    }

    if (userRole !== "AGENT") {
      return res.status(403).json({
        success: false,
        message: "Only agents and admins can update parcel status",
      });
    }

    const parcel = await prisma.parcel.findUnique({
      where: { id: parcelId },
      select: {
        id: true,
        agentId: true,
        status: true,
      },
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel not found",
      });
    }

    if (parcel.agentId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update status of parcels assigned to you",
      });
    }

    // Check if parcel status can be updated
    if (parcel.status === "DELIVERED" || parcel.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cannot update status of delivered or cancelled parcels",
      });
    }

    next();
  } catch (error) {
    console.error("Status update authorization error:", error);
    res.status(500).json({
      success: false,
      message: "Authorization check failed",
    });
  }
};

/**
 * Check if user can assign agents (Admin only)
 */
export const authorizeAgentAssignment = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Only admins can assign agents to parcels",
    });
  }
  next();
};

/**
 * Check if user can delete parcels (Admin only)
 */
export const authorizeParcelDeletion = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete parcels",
      });
    }

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const parcelId = req.params.id;

    const parcel = await prisma.parcel.findUnique({
      where: { id: parcelId },
      select: {
        status: true,
      },
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel not found",
      });
    }

    // Don't allow deletion of parcels that are in progress
    const protectedStatuses = ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];

    if (protectedStatuses.includes(parcel.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete parcel with status: ${parcel.status}`,
      });
    }

    next();
  } catch (error) {
    console.error("Parcel deletion authorization error:", error);
    res.status(500).json({
      success: false,
      message: "Authorization check failed",
    });
  }
};

/**
 * Rate limiting for sensitive operations
 */
export const rateLimitSensitive = (maxRequests = 10, windowMs = 60000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = `${req.user.id}_${req.route.path}`;
    const now = Date.now();

    const userAttempts = attempts.get(key) || [];
    const recentAttempts = userAttempts.filter((time) => now - time < windowMs);

    if (recentAttempts.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((recentAttempts[0] + windowMs - now) / 1000),
      });
    }

    recentAttempts.push(now);
    attempts.set(key, recentAttempts);

    // Clean up old entries periodically
    if (Math.random() < 0.1) {
      for (const [key, times] of attempts.entries()) {
        const validTimes = times.filter((time) => now - time < windowMs);
        if (validTimes.length === 0) {
          attempts.delete(key);
        } else {
          attempts.set(key, validTimes);
        }
      }
    }

    next();
  };
};

/**
 * Check business hours (optional - can be enabled for certain operations)
 */
export const checkBusinessHours = (req, res, next) => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday

  // Business hours: Monday-Saturday, 9 AM - 6 PM
  const isBusinessHour = day >= 1 && day <= 6 && hour >= 9 && hour < 18;

  if (!isBusinessHour && req.user.role !== "ADMIN") {
    return res.status(400).json({
      success: false,
      message: "This operation is only available during business hours (9 AM - 6 PM, Monday-Saturday)",
      currentTime: now.toISOString(),
    });
  }

  next();
};
