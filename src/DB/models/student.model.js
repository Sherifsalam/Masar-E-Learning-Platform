const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    studentId: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    grade: { type: String, required: true },   // e.g. "Grade 10"
    section: { type: String, required: true }, // e.g. "Section B"
    parentName: { type: String, default: "" },
    parentContact: { type: String, default: "" },
    parentEmail: { type: String, default: "" },
    avatarInitials: { type: String, default: "" },
  },
  { timestamps: true }
);

studentSchema.index({ fullName: "text", studentId: "text" });

module.exports = mongoose.model("Student", studentSchema);
