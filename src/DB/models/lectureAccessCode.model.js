const mongoose = require("mongoose");

/**
 * A prepaid access code for one recorded lecture.
 *
 * The centre sells a code at the desk; the student redeems it in the app to
 * unlock that lecture's video. A code is single-use: once `redeemedBy` is set
 * it cannot be used by anyone else, which is what makes reselling a code
 * pointless.
 */
const lectureAccessCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    lecture: { type: mongoose.Schema.Types.ObjectId, ref: "Lecture", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", default: null },

    redeemedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null },
    redeemedAt: { type: Date, default: null },

    // Free-text label for the desk, e.g. a receipt number.
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

// A student sees their unlocked lectures through this pair constantly.
lectureAccessCodeSchema.index({ redeemedBy: 1, lecture: 1 });

lectureAccessCodeSchema.virtual("isRedeemed").get(function isRedeemed() {
  return !!this.redeemedBy;
});

module.exports = mongoose.model("LectureAccessCode", lectureAccessCodeSchema);
