const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedOptionId: { type: mongoose.Schema.Types.ObjectId, default: null },
    shortAnswerText: { type: String, default: "" },
    isCorrect: { type: Boolean, default: false },
    pointsAwarded: { type: Number, default: 0 },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    answers: { type: [answerSchema], default: [] },
    scorePercent: { type: Number, default: null },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ quiz: 1, student: 1 });

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
