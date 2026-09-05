const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    period: { type: String, required: true }, // e.g. "August 2026"
    include: {
      attendance: { type: Boolean, default: true },
      grades: { type: Boolean, default: true },
      lectureEngagement: { type: Boolean, default: true },
      behaviorNotes: { type: Boolean, default: false },
    },
    teacherNote: { type: String, default: "" },
    sendMethod: { type: String, enum: ["email", "sms", "whatsapp"], default: "email" },
    snapshot: { type: mongoose.Schema.Types.Mixed, default: {} }, // computed data at send time
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
