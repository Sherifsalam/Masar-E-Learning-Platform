const nodemailer = require("nodemailer");

// Lazily builds a transporter only if SMTP credentials are configured.
// Without SMTP set, this logs to the console instead of failing, so the
// parent-report flow still works end-to-end in local development.
function buildTransporter() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

async function sendEmail({ to, subject, html }) {
  const transporter = buildTransporter();
  if (!transporter) {
    console.log("[emailService] SMTP not configured — logging email instead of sending:");
    console.log({ to, subject });
    return { simulated: true };
  }
  return transporter.sendMail({
    from: process.env.SMTP_FROM || "Masar <no-reply@masar.app>",
    to,
    subject,
    html,
  });
}

module.exports = { sendEmail };
