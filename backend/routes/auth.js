// routes/auth.js
import express from "express";
import { register, login, logout, getProfile, updateProfile, changePassword, refreshToken, verifyEmail, resendVerificationEmail, requestPasswordReset, resetPassword } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { validate, registerSchema, loginSchema, emailSchema, resetPasswordSchema, updateProfileSchema, changePasswordSchema } from "../middleware/validation.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many login attempts, please try again later",
});

const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests
  message: "Too many verification attempts",
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per hour
  message: "Too many password reset attempts",
});

// Apply rate limiting
router.use("/login", authLimiter);
router.use("/reset-password", authLimiter);
router.use("/resend-verification", verificationLimiter);
router.use("/forgot-password", passwordResetLimiter);

// Public routes
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refreshToken);
router.post("/logout", authenticate, logout); // Optional logout endpoint

// Email verification routes
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", validate(emailSchema), resendVerificationEmail);

// Password reset routes
router.post("/forgot-password", validate(emailSchema), requestPasswordReset);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

// Protected routes
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, validate(updateProfileSchema), updateProfile);
router.put("/change-password", authenticate, validate(changePasswordSchema), changePassword);

export default router;
