// middleware/errorHandler.js
import { validationErrorResponse, unauthorizedResponse, internalErrorResponse, notFoundResponse, badRequestResponse, conflictResponse, errorResponse } from "../utils/response.js";

export const errorHandler = (err, req, res, next) => {
  console.error("Error stack:", err.stack);

  // Prisma errors
  if (err.code === "P2002") {
    // Unique constraint violation
    const field = err.meta?.target?.[0] || "field";
    return conflictResponse(res, `A record with this ${field} already exists`);
  }

  if (err.code === "P2025") {
    // Record not found
    return notFoundResponse(res, "Record");
  }

  if (err.code === "P2003") {
    // Foreign key constraint violation
    return badRequestResponse(res, "Invalid reference: The referenced record does not exist");
  }

  if (err.code === "P2014") {
    // Invalid ID provided
    return badRequestResponse(res, "The provided ID is invalid or malformed");
  }

  // Validation errors (e.g., from Joi, Zod, or class-validator)
  if (err.name === "ValidationError" || err.isJoi) {
    const errors = err.details ? err.details : { message: err.message };
    return validationErrorResponse(res, "Validation failed", errors);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return unauthorizedResponse(res, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    return unauthorizedResponse(res, "Token expired");
  }

  // Cast errors (common with MongoDB, but can occur with Prisma too)
  if (err.name === "CastError") {
    return badRequestResponse(res, "Malformed data provided");
  }

  // Custom application errors
  if (err.isOperational) {
    return errorResponse(res, err.message, process.env.NODE_ENV === "development" ? err : null, err.statusCode || 500);
  }

  // Multer file upload errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return badRequestResponse(res, "File too large. Please upload a smaller file.");
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return badRequestResponse(res, "Unexpected file field. Please check your upload form.");
  }

  // Default to internal server error
  return internalErrorResponse(res, "Something went wrong", process.env.NODE_ENV === "development" ? err : null);
};
