const mongoose = require("mongoose");

const lectureProgressSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    lecture: { type: mongoose.Schema.Types.ObjectId, ref: "Lecture", required: true },
    watchedPercent: { type: Number, min: 0, max: 100, default: 0 },
    lastWatchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

lectureProgressSchema.index({ student: 1, lecture: 1 }, { unique: true });

module.exports = mongoose.model("LectureProgress", lectureProgressSchema);
