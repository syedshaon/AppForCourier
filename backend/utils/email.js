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
