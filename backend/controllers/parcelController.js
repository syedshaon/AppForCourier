import { PrismaClient } from "@prisma/client";
import QRCode from "qrcode";
import { generateTrackingNumber } from "../utils/trackingGenerator.js";
import { calculateShippingCost } from "../utils/shippingCalculator.js";

import { sendParcelStatusUpdateEmail, sendAgentAssignmentEmail, sendParcelCreationEmail } from "../utils/email.js";

const prisma = new PrismaClient();

// Create a new parcel with address handling
export const createParcel = async (req, res) => {
  try {
    const { pickupAddress, deliveryAddress, parcelSize, parcelType, weight, description, paymentType, codAmount, pickupDate } = req.body;

    const customerId = req.user.id;

    // Generate unique tracking number
    const trackingNumber = generateTrackingNumber();

    // Calculate shipping cost based on size, weight, and distance
    const shippingCost = calculateShippingCost({
      size: parcelSize,
      weight,
      pickupAddress,
      deliveryAddress,
    });

    // Start transaction to create addresses and parcel atomically
    const result = await prisma.$transaction(async (tx) => {
      // Create pickup address
      const pickupAddr = await tx.address.create({
        data: {
          street: pickupAddress.street,
          city: pickupAddress.city,
          state: pickupAddress.state,
          zipCode: pickupAddress.zipCode,
          country: pickupAddress.country || "Bangladesh",
          latitude: pickupAddress.latitude,
          longitude: pickupAddress.longitude,
          phoneNumber: pickupAddress.phoneNumber,
        },
      });

      // Create delivery address
      const deliveryAddr = await tx.address.create({
        data: {
          street: deliveryAddress.street,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          zipCode: deliveryAddress.zipCode,
          country: deliveryAddress.country || "Bangladesh",
          latitude: deliveryAddress.latitude,
          longitude: deliveryAddress.longitude,
          phoneNumber: deliveryAddress.phoneNumber,
        },
      });

      // Generate QR code for the tracking number
      // const qrCode = await QRCode.toDataURL(trackingNumber);
      // qrcode will be like http://localhost:5173/parcels/track/CMS20250823537384 where http://localhost:5173 is the frontend URL and CMS20250823537384 is the tracking number

      const qrCode = await QRCode.toDataURL(`${process.env.FRONTEND_URL}/parcels/track/${trackingNumber}`);

      // Create expected delivery date (3-5 business days from pickup)
      let expectedDelivery;
      if (pickupDate) {
        expectedDelivery = new Date(pickupDate);
        expectedDelivery.setDate(expectedDelivery.getDate() + 4); // +4 days after pickup
      } else {
        expectedDelivery = new Date();
        expectedDelivery.setDate(expectedDelivery.getDate() + 5); // +5 days from today
      }
      // Create parcel
      const parcel = await tx.parcel.create({
        data: {
          trackingNumber,
          customerId,
          pickupAddressId: pickupAddr.id,
          deliveryAddressId: deliveryAddr.id,
          parcelSize,
          parcelType,
          weight: weight ? parseFloat(weight) : null,
          description,
          paymentType,
          codAmount: codAmount ? parseFloat(codAmount) : null,
          shippingCost,
          qrCode,
          pickupDate: pickupDate ? new Date(pickupDate) : null,
          expectedDelivery,
        },
        include: {
          pickupAddress: true,
          deliveryAddress: true,
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
      });

      // Create initial status update
      await tx.statusUpdate.create({
        data: {
          parcelId: parcel.id,
          status: "PENDING",
          notes: "Parcel booking created successfully",
        },
      });

      return parcel;
    });

    // Send email confirmation to customer
    try {
      await sendParcelCreationEmail(result);
    } catch (emailError) {
      console.error("Failed to send creation confirmation email:", emailError);
      // Don't fail the request if email fails
    }
    // Emit real-time update
    req.io.to(`parcel_${trackingNumber}`).emit("parcelCreated", {
      trackingNumber,
      status: "PENDING",
      message: "Your parcel has been booked successfully!",
    });

    res.status(201).json({
      success: true,
      message: "Parcel created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Create parcel error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create parcel",
      error: error.message,
    });
  }
};

// Get parcels for authenticated customer
export const getUserParcels = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const where = { customerId };

    if (status) {
      where.status = status;
    }

    const [parcels, total] = await Promise.all([
      prisma.parcel.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          pickupAddress: true,
          deliveryAddress: true,
          agent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
          statusUpdates: {
            orderBy: { timestamp: "desc" },
            take: 1,
          },
        },
      }),
      prisma.parcel.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        parcels,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get user parcels error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch parcels",
      error: error.message,
    });
  }
};

// Get single parcel by ID
export const getParcelById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const parcel = await prisma.parcel.findUnique({
      where: { id },
      include: {
        pickupAddress: true,
        deliveryAddress: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        statusUpdates: {
          orderBy: { timestamp: "desc" },
          include: {
            agent: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel not found",
      });
    }

    // Check access permissions
    if (userRole === "CUSTOMER" && parcel.customerId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (userRole === "AGENT" && parcel.agentId !== userId && parcel.customerId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: parcel,
    });
  } catch (error) {
    console.error("Get parcel by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch parcel",
      error: error.message,
    });
  }
};

// Track parcel by tracking number (public)
export const getParcelByTracking = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const parcel = await prisma.parcel.findUnique({
      where: { trackingNumber },
      include: {
        pickupAddress: {
          select: {
            city: true,
            state: true,
            zipCode: true,
          },
        },
        deliveryAddress: {
          select: {
            city: true,
            state: true,
            zipCode: true,
          },
        },
        statusUpdates: {
          orderBy: { timestamp: "desc" },
          select: {
            status: true,
            notes: true,
            timestamp: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel not found with this tracking number",
      });
    }

    // Return limited info for public tracking
    const trackingInfo = {
      trackingNumber: parcel.trackingNumber,
      status: parcel.status,
      pickupCity: parcel.pickupAddress.city,
      deliveryCity: parcel.deliveryAddress.city,
      expectedDelivery: parcel.expectedDelivery,
      actualDelivery: parcel.actualDelivery,
      statusHistory: parcel.statusUpdates,
    };

    res.json({
      success: true,
      data: trackingInfo,
    });
  } catch (error) {
    console.error("Track parcel error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track parcel",
      error: error.message,
    });
  }
};

// Update parcel status (Agent/Admin)
// Update parcel status (Agent/Admin)
export const updateParcelStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, latitude, longitude } = req.body;
    const agentId = req.user.id;
    const userRole = req.user.role;

    const parcel = await prisma.parcel.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel not found",
      });
    }

    // Add this validation - prevent updating delivered parcels
    if (parcel.status === "DELIVERED") {
      return res.status(400).json({
        success: false,
        message: "Cannot update status of delivered parcel",
      });
    }

    // Add authorization check for agents - they can only update if assigned
    if (userRole === "AGENT" && parcel.agentId !== agentId) {
      return res.status(403).json({
        success: false,
        message: "Access denied - not assigned to this parcel",
      });
    }

    // Rest of your update logic...
    // Update parcel status and create status update record
    const updatedParcel = await prisma.$transaction(async (tx) => {
      const updated = await tx.parcel.update({
        where: { id },
        data: {
          status,
          actualDelivery: status === "DELIVERED" ? new Date() : null,
        },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          pickupAddress: true,
          deliveryAddress: true,
        },
      });

      await tx.statusUpdate.create({
        data: {
          parcelId: id,
          agentId: req.user.role === "AGENT" ? agentId : null,
          status,
          notes,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
        },
      });

      return updated;
    });

    // Send email notification to customer about status change
    try {
      await sendParcelStatusUpdateEmail(updatedParcel, status, notes);
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError);
      // Don't fail the request if email fails
    }

    // Emit real-time update
    req.io.to(`parcel_${parcel.trackingNumber}`).emit("statusUpdated", {
      trackingNumber: parcel.trackingNumber,
      status,
      notes,
      timestamp: new Date(),
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
    });

    res.json({
      success: true,
      message: "Parcel status updated successfully",
      data: updatedParcel,
    });
  } catch (error) {
    console.error("Update parcel status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update parcel status",
      error: error.message,
    });
  }
};

// Get parcels assigned to agent
export const getParcelsByAgent = async (req, res) => {
  try {
    const agentId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const where = { agentId };

    if (status) {
      where.status = status;
    }

    const [parcels, total] = await Promise.all([
      prisma.parcel.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          pickupAddress: true,
          deliveryAddress: true,
          customer: {
            select: {
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
          statusUpdates: {
            orderBy: { timestamp: "desc" },
            take: 1,
          },
        },
      }),
      prisma.parcel.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        parcels,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get agent parcels error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned parcels",
      error: error.message,
    });
  }
};

// Get all parcels (Admin)
export const getAllParcels = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { trackingNumber: { contains: search, mode: "insensitive" } },
        {
          customer: {
            OR: [{ firstName: { contains: search, mode: "insensitive" } }, { lastName: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }],
          },
        },
      ];
    }

    const [parcels, total] = await Promise.all([
      prisma.parcel.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          pickupAddress: true,
          deliveryAddress: true,
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
            },
          },
          agent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
        },
      }),
      prisma.parcel.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        parcels,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all parcels error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch parcels",
      error: error.message,
    });
  }
};

// Assign agent to parcel (Admin)
export const assignAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    // Verify agent exists and has AGENT role
    const agent = await prisma.user.findUnique({
      where: { id: agentId, role: "AGENT", isActive: true },
    });

    if (!agent) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent or agent not found",
      });
    }

    const updatedParcel = await prisma.$transaction(async (tx) => {
      const parcel = await tx.parcel.update({
        where: { id },
        data: {
          agentId,
          status: "ASSIGNED",
        },
        include: {
          customer: { select: { firstName: true, lastName: true, email: true } },
          agent: { select: { firstName: true, lastName: true } },
          pickupAddress: true,
          deliveryAddress: true,
        },
      });

      await tx.statusUpdate.create({
        data: {
          parcelId: id,
          status: "ASSIGNED",
          notes: `Assigned to agent: ${agent.firstName} ${agent.lastName}`,
        },
      });

      return parcel;
    });

    // Send email notification to agent
    try {
      await sendAgentAssignmentEmail(agent, updatedParcel);
    } catch (emailError) {
      console.error("Failed to send agent assignment email:", emailError);
      // Don't fail the request if email fails
    }

    // Send email notification to customer about agent assignment
    try {
      await sendParcelStatusUpdateEmail(updatedParcel, "ASSIGNED", `Agent ${agent.firstName} ${agent.lastName} has been assigned to your parcel`);
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError);
      // Don't fail the request if email fails
    }

    // Emit real-time update
    req.io.to(`parcel_${updatedParcel.trackingNumber}`).emit("agentAssigned", {
      trackingNumber: updatedParcel.trackingNumber,
      agent: {
        name: `${agent.firstName} ${agent.lastName}`,
        phone: agent.phoneNumber,
      },
    });

    res.json({
      success: true,
      message: "Agent assigned successfully",
      data: updatedParcel,
    });
  } catch (error) {
    console.error("Assign agent error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign agent",
      error: error.message,
    });
  }
};

// Search parcels (Admin)
export const searchParcels = async (req, res) => {
  try {
    const { q, status, dateFrom, dateTo } = req.query;

    const where = {};

    if (q) {
      where.OR = [
        { trackingNumber: { contains: q, mode: "insensitive" } },
        {
          customer: {
            OR: [{ firstName: { contains: q, mode: "insensitive" } }, { lastName: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { phoneNumber: { contains: q, mode: "insensitive" } }],
          },
        },
        {
          pickupAddress: {
            OR: [{ city: { contains: q, mode: "insensitive" } }, { state: { contains: q, mode: "insensitive" } }],
          },
        },
        {
          deliveryAddress: {
            OR: [{ city: { contains: q, mode: "insensitive" } }, { state: { contains: q, mode: "insensitive" } }],
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const parcels = await prisma.parcel.findMany({
      where,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        pickupAddress: {
          select: {
            city: true,
            state: true,
          },
        },
        deliveryAddress: {
          select: {
            city: true,
            state: true,
          },
        },
        agent: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit search results
    });

    res.json({
      success: true,
      data: parcels,
    });
  } catch (error) {
    console.error("Search parcels error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search parcels",
      error: error.message,
    });
  }
};

// Delete parcel (Admin)
export const deleteParcel = async (req, res) => {
  try {
    const { id } = req.params;

    const parcel = await prisma.parcel.findUnique({
      where: { id },
      select: { status: true, trackingNumber: true },
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel not found",
      });
    }

    // Don't allow deletion of parcels that are in transit or delivered
    if (["IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(parcel.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete parcel that is in transit or delivered",
      });
    }

    await prisma.parcel.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Parcel deleted successfully",
    });
  } catch (error) {
    console.error("Delete parcel error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete parcel",
      error: error.message,
    });
  }
};
