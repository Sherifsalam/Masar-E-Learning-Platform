const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

async function createCheckInSession() {
  const sessionToken = uuidv4();
  const qrDataUrl = await QRCode.toDataURL(sessionToken);
  return { sessionToken, qrDataUrl };
}

module.exports = { createCheckInSession };
