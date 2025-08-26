import nodemailer from "nodemailer";
import crypto from "crypto";

// Create email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  service: "Gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate verification token
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Generate password reset token
export const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Send email verification
export const sendVerificationEmail = async (email, firstName, verificationToken) => {
  try {
    // const transporter = createTransporter();
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `"Rui Courier" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Verify Your Email - Rui Courier",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
            <h1>Welcome to Rui Courier!</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2>Hi ${firstName},</h2>
            <p>Thank you for registering. Please verify your email address:</p>
            <a href="${verificationUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Verify Email</a>
            <p>Or copy this link: ${verificationUrl}</p>
            <p><strong>This link expires in 24 hours.</strong></p>
          </div>
          <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            © 2024 Rui Courier. All rights reserved.
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  try {
    // const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"Rui Courier" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Password Reset - Rui Courier",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: #ef4444; color: white; padding: 20px; text-align: center;">
            <h1>Password Reset Request</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2>Hi ${firstName},</h2>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
            <p>Or copy this link: ${resetUrl}</p>
            <p><strong>This link expires in 1 hour.</strong></p>
            <p>If you didn't request this, ignore this email.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

// / Get status description for customer-friendly messaging
const getStatusDescription = (status) => {
  const statusDescriptions = {
    PENDING: "Your parcel booking has been received and is being processed",
    ASSIGNED: "A delivery agent has been assigned to your parcel",
    PICKED_UP: "Your parcel has been picked up and is ready for transit",
    IN_TRANSIT: "Your parcel is on the way to its destination",
    OUT_FOR_DELIVERY: "Your parcel is out for delivery and will arrive soon",
    DELIVERED: "Your parcel has been successfully delivered",
    FAILED: "There was an issue with your parcel delivery",
    CANCELLED: "Your parcel delivery has been cancelled",
  };
  return statusDescriptions[status] || "Your parcel status has been updated";
};

// Get status color for email styling
const getStatusColor = (status) => {
  const statusColors = {
    PENDING: "#f59e0b",
    ASSIGNED: "#3b82f6",
    PICKED_UP: "#8b5cf6",
    IN_TRANSIT: "#06b6d4",
    OUT_FOR_DELIVERY: "#10b981",
    DELIVERED: "#22c55e",
    FAILED: "#ef4444",
    CANCELLED: "#6b7280",
  };
  return statusColors[status] || "#6b7280";
};

// Send parcel status update email to customer
export const sendParcelStatusUpdateEmail = async (parcelData, newStatus, notes = "") => {
  try {
    const { customer, trackingNumber, pickupAddress, deliveryAddress } = parcelData;

    const trackingUrl = `${process.env.FRONTEND_URL}/parcels/track/${trackingNumber}`;
    const statusDescription = getStatusDescription(newStatus);
    const statusColor = getStatusColor(newStatus);

    const mailOptions = {
      from: `"Rui Courier" <${process.env.EMAIL_FROM}>`,
      to: customer.email,
      subject: `Parcel Update: ${newStatus.replace("_", " ")} - ${trackingNumber}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: ${statusColor}; color: white; padding: 20px; text-align: center;">
            <h1>Parcel Status Update</h1>
            <h2 style="margin: 10px 0; font-size: 24px;">${newStatus.replace("_", " ")}</h2>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2>Hi ${customer.firstName},</h2>
            <p style="font-size: 16px; margin: 20px 0;">${statusDescription}</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor};">
              <h3 style="margin-top: 0; color: #1f2937;">Tracking Details</h3>
              <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
              <p><strong>From:</strong> ${pickupAddress.city}, ${pickupAddress.state}, ${pickupAddress.phoneNumber}</p>
              <p><strong>To:</strong> ${deliveryAddress.city}, ${deliveryAddress.state}, ${deliveryAddress.phoneNumber}</p>
              ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${trackingUrl}" style="display: inline-block; background: ${statusColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Track Your Parcel</a>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              You can track your parcel anytime by visiting: <a href="${trackingUrl}" style="color: ${statusColor};">${trackingUrl}</a>
            </p>
          </div>
          
          <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>Need help? Contact us at support@ruicourier.com</p>
            <p>© 2024 Rui Courier. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Status update email sent to ${customer.email} for parcel ${trackingNumber}`);
  } catch (error) {
    console.error("❌ Error sending status update email:", error);
    // Don't throw error to avoid breaking the main flow
  }
};

// Send agent assignment notification email
export const sendAgentAssignmentEmail = async (agentData, parcelData) => {
  try {
    const { email, firstName } = agentData;
    const { trackingNumber, customer, pickupAddress, deliveryAddress, parcelType, parcelSize } = parcelData;
    const parcelUrl = `${process.env.FRONTEND_URL}/agent/parcels/${parcelData.id}`;

    const mailOptions = {
      from: `"Rui Courier" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `New Parcel Assignment - ${trackingNumber}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
            <h1>New Parcel Assignment</h1>
            <h2 style="margin: 10px 0;">${trackingNumber}</h2>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2>Hi ${firstName},</h2>
            <p style="font-size: 16px;">You have been assigned a new parcel for delivery.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="margin-top: 0; color: #1f2937;">Parcel Details</h3>
              <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
              <p><strong>Customer:</strong> ${customer.firstName} ${customer.lastName}</p>
              <p><strong>Customer Phone:</strong> ${customer.phoneNumber}</p>
              <p><strong>Type:</strong> ${parcelType}</p>
              <p><strong>Size:</strong> ${parcelSize}</p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="margin-top: 0; color: #1f2937;">Pickup Address</h3>
              <p>${pickupAddress.street} , ${pickupAddress.phoneNumber}</p>
              <p>${pickupAddress.city}, ${pickupAddress.state} ${pickupAddress.zipCode}</p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="margin-top: 0; color: #1f2937;">Delivery Address</h3>
              <p>${deliveryAddress.street}, ${deliveryAddress.phoneNumber}</p>
              <p>${deliveryAddress.city}, ${deliveryAddress.state} ${deliveryAddress.zipCode}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${parcelUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Parcel Details</a>
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;"><strong>Action Required:</strong> Please log in to your agent portal to update the parcel status and begin the delivery process.</p>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>Questions? Contact support at support@ruicourier.com</p>
            <p>© 2024 Rui Courier. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Assignment email sent to agent ${email} for parcel ${trackingNumber}`);
  } catch (error) {
    console.error("❌ Error sending agent assignment email:", error);
    // Don't throw error to avoid breaking the main flow
  }
};

// Send parcel creation confirmation email to customer
export const sendParcelCreationEmail = async (parcelData) => {
  try {
    const { customer, trackingNumber, pickupAddress, deliveryAddress, shippingCost, expectedDelivery } = parcelData;
    const trackingUrl = `${process.env.FRONTEND_URL}/parcels/track/${trackingNumber}`;

    const mailOptions = {
      from: `"Rui Courier" <${process.env.EMAIL_FROM}>`,
      to: customer.email,
      subject: `Parcel Booking Confirmation - ${trackingNumber}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: #22c55e; color: white; padding: 20px; text-align: center;">
            <h1>Booking Confirmed!</h1>
            <h2 style="margin: 10px 0;">${trackingNumber}</h2>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2>Hi ${customer.firstName},</h2>
            <p style="font-size: 16px;">Your parcel has been successfully booked with Rui Courier.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
              <h3 style="margin-top: 0; color: #1f2937;">Booking Details</h3>
              <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
              <p><strong>From:</strong> ${pickupAddress.city}, ${pickupAddress.state}, ${pickupAddress.phoneNumber}</p>
              <p><strong>To:</strong> ${deliveryAddress.city}, ${deliveryAddress.state}, ${deliveryAddress.phoneNumber}</p>
              <p><strong>Shipping Cost:</strong> ৳${shippingCost}</p>
              <p><strong>Expected Delivery:</strong> ${new Date(expectedDelivery).toLocaleDateString()}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${trackingUrl}" style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Track Your Parcel</a>
            </div>

            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af;"><strong>What's Next:</strong> We'll assign a delivery agent to your parcel and keep you updated via email throughout the delivery process.</p>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>Need help? Contact us at support@ruicourier.com</p>
            <p>© 2024 Rui Courier. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Creation confirmation email sent to ${customer.email} for parcel ${trackingNumber}`);
  } catch (error) {
    console.error("❌ Error sending creation confirmation email:", error);
    // Don't throw error to avoid breaking the main flow
  }
};
