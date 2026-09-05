const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    fileType: { type: String, enum: ["pdf", "doc", "ppt", "other"], required: true },
    storedFileName: { type: String, required: true }, // name on disk
    originalFileName: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    grade: { type: String, default: "" },
    section: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FileResource", fileSchema);
