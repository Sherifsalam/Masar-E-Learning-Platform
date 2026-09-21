const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({ text: { type: String, required: true } }, { _id: true });

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    type: { type: String, enum: ["mcq", "true_false", "short_answer"], default: "mcq" },
    options: { type: [optionSchema], default: [] },
    correctOptionId: { type: mongoose.Schema.Types.ObjectId, default: null },
    correctShortAnswer: { type: String, default: "" },
    points: { type: Number, default: 10 },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    grade: { type: String, default: "" },
    section: { type: String, default: "" },
    questions: { type: [questionSchema], default: [] },
    durationMinutes: { type: Number, default: 20 },
    dueDate: { type: Date, default: null },
    openAt: { type: Date, default: null },
    status: { type: String, enum: ["draft", "published", "scheduled"], default: "draft" },
    settings: {
      shuffleQuestions: { type: Boolean, default: true },
      showScoreImmediately: { type: Boolean, default: true },
      allowRetake: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
