const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

// Generates a one-time session token for a classroom check-in window and
// renders it as a QR code (data URL) the teacher can display on screen.
async function createCheckInSession() {
  const sessionToken = uuidv4();
  const qrDataUrl = await QRCode.toDataURL(sessionToken);
  return { sessionToken, qrDataUrl };
}

module.exports = { createCheckInSession };
