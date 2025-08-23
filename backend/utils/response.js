// utils/response.js

const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    ...(data && { data }),
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

const errorResponse = (res, message, error = null, statusCode = 500) => {
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && error && { error: error.message || error }),
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

const validationErrorResponse = (res, message, errors, statusCode = 400) => {
  const response = {
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

const notFoundResponse = (res, resource = "Resource") => {
  return errorResponse(res, `${resource} not found`, null, 404);
};

const unauthorizedResponse = (res, message = "Unauthorized access") => {
  return errorResponse(res, message, null, 401);
};

const forbiddenResponse = (res, message = "Insufficient permissions") => {
  return errorResponse(res, message, null, 403);
};

const badRequestResponse = (res, message, error = null) => {
  return errorResponse(res, message, error, 400);
};

const internalErrorResponse = (res, message = "Internal server error", error = null) => {
  return errorResponse(res, message, error, 500);
};

const conflictResponse = (res, message) => {
  return errorResponse(res, message, null, 409);
};

const tooManyRequestsResponse = (res, message = "Too many requests") => {
  return errorResponse(res, message, null, 429);
};

export { successResponse, errorResponse, validationErrorResponse, notFoundResponse, unauthorizedResponse, forbiddenResponse, badRequestResponse, internalErrorResponse, conflictResponse, tooManyRequestsResponse };

/*

// Import the response utilities
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  conflictResponse,
  badRequestResponse,
  internalErrorResponse
} from '../utils/response.js';

// Register function - updated with response utilities
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

      return successResponse(
        res, 
        "Registration successful! Please check your email to verify your account.", 
        { user, emailSent: true },
        201
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      
      return successResponse(
        res,
        "Registration successful! However, we could not send the verification email.",
        { user, emailSent: false },
        201
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return internalErrorResponse(res, "Internal server error during registration", error);
  }
};

// Login function - updated with response utilities
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

    return successResponse(
      res,
      "Login successful",
      { user: userWithoutSensitiveData, token }
    );
  } catch (error) {
    console.error("Login error:", error);
    return internalErrorResponse(res, "Internal server error during login", error);
  }
};

// Get user profile - updated with response utilities
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
        _count: {
          bookedParcels: true,
          assignedParcels: true,
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

// Email verification endpoint - updated with response utilities
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

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

*/
