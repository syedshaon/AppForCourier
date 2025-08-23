/**
 * Generate unique tracking number
 * Format: CMS + YYYYMMDD + 6-digit random number
 * Example: CMS20241215123456
 */
export const generateTrackingNumber = () => {
  const prefix = "CMS"; // Courier Management System
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Generate 6-digit random number
  const randomNum = Math.floor(100000 + Math.random() * 900000);

  return `${prefix}${year}${month}${day}${randomNum}`;
};

/**
 * Validate tracking number format
 */
export const validateTrackingNumber = (trackingNumber) => {
  const pattern = /^CMS\d{14}$/;
  return pattern.test(trackingNumber);
};

/**
 * Extract date from tracking number
 */
export const extractDateFromTracking = (trackingNumber) => {
  if (!validateTrackingNumber(trackingNumber)) {
    return null;
  }

  const dateStr = trackingNumber.substring(3, 11); // Extract YYYYMMDD
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1; // Month is 0-indexed
  const day = parseInt(dateStr.substring(6, 8));

  return new Date(year, month, day);
};

/**
 * Generate QR code friendly tracking number
 */
export const generateQRTrackingNumber = () => {
  return generateTrackingNumber();
};
