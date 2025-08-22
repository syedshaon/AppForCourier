import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { unauthorizedResponse } from "../utils/response.js"; // Import the utility

const prisma = new PrismaClient();

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return unauthorizedResponse(res, "Access denied. No token provided.");
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
      },
    });

    if (!user || !user.isActive) {
      return unauthorizedResponse(res, "Invalid token or user inactive.");
    }

    req.user = user;
    next();
  } catch (error) {
    return unauthorizedResponse(res, "Invalid token.");
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorizedResponse(res, "Access denied.");
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions." });
    }

    next();
  };
};
