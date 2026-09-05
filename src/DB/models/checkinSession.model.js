const mongoose = require("mongoose");

// A short-lived QR session a teacher opens for a class; students "scan" it
// by posting its sessionToken back to the server before it expires.
const checkinSessionSchema = new mongoose.Schema(
  {
    sessionToken: { type: String, required: true, unique: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    subject: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CheckinSession", checkinSessionSchema);
