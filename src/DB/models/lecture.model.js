const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    videoUrl: { type: String, required: true },
    thumbnailColor: { type: String, default: "#2952E3" },
    durationMinutes: { type: Number, required: true },
    grade: { type: String, default: "" },
    section: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lecture", lectureSchema);
