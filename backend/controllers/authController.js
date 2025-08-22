import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma.js";
import { generateToken } from "../utils/jwt.js";
import { generateVerificationToken, generatePasswordResetToken, sendVerificationEmail, sendPasswordResetEmail } from "../utils/email.js";
import { addToBlacklist } from "../utils/tokenBlacklist.js";
import { successResponse, errorResponse, validationErrorResponse, notFoundResponse, unauthorizedResponse, badRequestResponse, conflictResponse, internalErrorResponse } from "../utils/response.js";

// Register function
export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, address, role = "CUSTOMER" } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNumber }],
      },
    });

    if (existingUser) {
      return conflictResponse(res, "User with this email or phone number already exists");
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate email verification token
    const emailVerifyToken = generateVerificationToken();
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        address,
        role,
        emailVerifyToken,
        emailVerifyExpires,
        isEmailVerified: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        address: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, firstName, emailVerifyToken);

      return successResponse(res, "Registration successful! Please check your email to verify your account.", { user, emailSent: true }, 201);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return successResponse(res, "Registration successful! However, we could not send the verification email.", { user, emailSent: false }, 201);
    }
  } catch (error) {
    console.error("Registration error:", error);
    return internalErrorResponse(res, "Internal server error during registration", error);
  }
};

// Login function
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return unauthorizedResponse(res, "Invalid email or password");
    }

    // Check if user is active
    if (!user.isActive) {
      return unauthorizedResponse(res, "Account is deactivated. Please contact support.");
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return unauthorizedResponse(res, "Please verify your email address before logging in.");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return unauthorizedResponse(res, "Invalid email or password");
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user data without sensitive fields
    const { password: _, emailVerifyToken, emailVerifyExpires, passwordResetToken, passwordResetExpires, ...userWithoutSensitiveData } = user;

    return successResponse(res, "Login successful", { user: userWithoutSensitiveData, token });
  } catch (error) {
    console.error("Login error:", error);
    return internalErrorResponse(res, "Internal server error during login", error);
  }
};

// Get user profile
// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        address: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        // Fix the _count syntax
        _count: {
          select: {
            bookedParcels: true,
            assignedParcels: true,
          },
        },
      },
    });

    if (!user) {
      return notFoundResponse(res, "User");
    }

    return successResponse(res, "User profile retrieved successfully", { user });
  } catch (error) {
    console.error("Get profile error:", error);
    return internalErrorResponse(res, "Internal server error", error);
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, address } = req.body;
    const userId = req.user.id;

    // Check if phone number is already taken by another user
    if (phoneNumber) {
      const existingUser = await prisma.user.findFirst({
        where: {
          phoneNumber,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return conflictResponse(res, "Phone number is already registered to another user");
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phoneNumber && { phoneNumber }),
        ...(address !== undefined && { address }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        address: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        updatedAt: true,
      },
    });

    return successResponse(res, "Profile updated successfully", { user: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    return internalErrorResponse(res, "Internal server error", error);
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return badRequestResponse(res, "Current password and new password are required");
    }

    if (newPassword.length < 6) {
      return badRequestResponse(res, "New password must be at least 6 characters long");
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return notFoundResponse(res, "User");
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return unauthorizedResponse(res, "Current password is incorrect");
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return successResponse(res, "Password changed successfully");
  } catch (error) {
    console.error("Change password error:", error);
    return internalErrorResponse(res, "Internal server error", error);
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return badRequestResponse(res, "Refresh token is required");
    }

    // Verify the token using our utility function
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
      },
    });

    if (!user || !user.isActive || !user.isEmailVerified) {
      return unauthorizedResponse(res, "Invalid token or user inactive");
    }

    // Generate new token
    const newToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse(res, "Token refreshed successfully", { token: newToken, user });
  } catch (error) {
    console.error("Refresh token error:", error);
    return unauthorizedResponse(res, "Invalid refresh token");
  }
};

// Email verification endpoint
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    console.log("Verification token:", token);

    if (!token) {
      return badRequestResponse(res, "Verification token is required");
    }

    // Find user with valid verification token
    const user = await prisma.user.findUnique({
      where: {
        emailVerifyToken: token,
        emailVerifyExpires: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      return badRequestResponse(res, "Invalid or expired verification token");
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });

    return successResponse(res, "Email verified successfully! You can now log in.");
  } catch (error) {
    console.error("Email verification error:", error);
    return internalErrorResponse(res, "Internal server error during email verification", error);
  }
};

// Resend verification email
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return badRequestResponse(res, "Email is required");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return notFoundResponse(res, "User");
    }

    if (user.isEmailVerified) {
      return badRequestResponse(res, "Email is already verified");
    }

    // Generate new verification token
    const emailVerifyToken = generateVerificationToken();
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken,
        emailVerifyExpires,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, user.firstName, emailVerifyToken);

    return successResponse(res, "Verification email sent successfully!");
  } catch (error) {
    console.error("Resend verification error:", error);
    return internalErrorResponse(res, "Failed to send verification email", error);
  }
};

// Request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return badRequestResponse(res, "Email is required");
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return the same message for security
    const responseMessage = "If an account with that email exists, a password reset link has been sent.";

    if (!user) {
      return successResponse(res, responseMessage);
    }

    // Only generate and send reset token if user exists
    const passwordResetToken = generatePasswordResetToken();
    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken, passwordResetExpires },
    });

    try {
      await sendPasswordResetEmail(email, user.firstName, passwordResetToken);
    } catch (emailError) {
      console.error("Password reset email failed:", emailError);
    }

    return successResponse(res, responseMessage);
  } catch (error) {
    console.error("Password reset request error:", error);
    return internalErrorResponse(res, "Failed to process password reset request", error);
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return badRequestResponse(res, "Token and new password are required");
    }

    if (newPassword.length < 6) {
      return badRequestResponse(res, "Password must be at least 6 characters long");
    }

    // Find user with valid reset token
    const user = await prisma.user.findUnique({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      return badRequestResponse(res, "Invalid or expired reset token");
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return successResponse(res, "Password reset successful! You can now log in with your new password.");
  } catch (error) {
    console.error("Password reset error:", error);
    return internalErrorResponse(res, "Internal server error during password reset", error);
  }
};

export const logout = (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      // Add token to blacklist
      addToBlacklist(token);
    }

    return successResponse(res, "Logged out successfully");
  } catch (error) {
    return internalErrorResponse(res, "Error during logout", process.env.NODE_ENV === "development" ? error : null);
  }
};
