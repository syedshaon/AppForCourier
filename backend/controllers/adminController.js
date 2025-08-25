import { prisma } from "../utils/prisma.js";
import { successResponse, errorResponse, notFoundResponse, unauthorizedResponse, badRequestResponse, internalErrorResponse } from "../utils/response.js";

// Get all users with role filtering
export const getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "ADMIN") {
      return unauthorizedResponse(res, "Admin access required");
    }

    const { role, page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (role && ["ADMIN", "AGENT", "CUSTOMER"].includes(role.toUpperCase())) {
      where.role = role.toUpperCase();
    }

    if (search) {
      where.OR = [{ email: { contains: search, mode: "insensitive" } }, { firstName: { contains: search, mode: "insensitive" } }, { lastName: { contains: search, mode: "insensitive" } }, { phoneNumber: { contains: search, mode: "insensitive" } }];
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
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
            select: {
              bookedParcels: true,
              assignedParcels: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return successResponse(res, "Users retrieved successfully", {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return internalErrorResponse(res, "Failed to retrieve users", error);
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return unauthorizedResponse(res, "Admin access required");
    }

    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
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

    return successResponse(res, "User retrieved successfully", { user });
  } catch (error) {
    console.error("Get user error:", error);
    return internalErrorResponse(res, "Failed to retrieve user", error);
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return unauthorizedResponse(res, "Admin access required");
    }

    const { id } = req.params;
    const { role } = req.body;

    // Check if target user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return notFoundResponse(res, "User");
    }

    // Prevent self-role change
    if (user.id === req.user.id) {
      return badRequestResponse(res, "Cannot change your own role");
    }

    // Validate role transition
    if (user.role === "ADMIN") {
      return badRequestResponse(res, "Cannot change role of another admin");
    }

    // Don't allow changing role to ADMIN
    if (role === "ADMIN") {
      return badRequestResponse(res, "Cannot assign ADMIN role");
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
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

    return successResponse(res, "User role updated successfully", { user: updatedUser });
  } catch (error) {
    console.error("Update user role error:", error);
    return internalErrorResponse(res, "Failed to update user role", error);
  }
};

// Deactivate user
export const deactivateUser = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return unauthorizedResponse(res, "Admin access required");
    }

    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return notFoundResponse(res, "User");
    }

    if (user.id === req.user.id) {
      return badRequestResponse(res, "Cannot deactivate your own account");
    }

    if (!user.isActive) {
      return badRequestResponse(res, "User is already deactivated");
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        refreshToken: null, // Invalidate sessions
        refreshTokenExpires: null,
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

    return successResponse(res, "User deactivated successfully", { user: updatedUser });
  } catch (error) {
    console.error("Deactivate user error:", error);
    return internalErrorResponse(res, "Failed to deactivate user", error);
  }
};

// Activate user
export const activateUser = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return unauthorizedResponse(res, "Admin access required");
    }

    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return notFoundResponse(res, "User");
    }

    if (user.isActive) {
      return badRequestResponse(res, "User is already active");
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: true },
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

    return successResponse(res, "User activated successfully", { user: updatedUser });
  } catch (error) {
    console.error("Activate user error:", error);
    return internalErrorResponse(res, "Failed to activate user", error);
  }
};
