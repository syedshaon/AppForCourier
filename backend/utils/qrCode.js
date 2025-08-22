import QRCode from "qrcode";

export const generateQRCode = async (trackingNumber) => {
  try {
    const qrCodeData = await QRCode.toDataURL(trackingNumber);
    return qrCodeData;
  } catch (error) {
    throw new Error("Failed to generate QR code");
  }
};
