const Quiz = require("../../DB/models/quiz.model");
const QuizAttempt = require("../../DB/models/quizAttempt.model");
const Student = require("../../DB/models/student.model");
const ApiError = require("../../utils/apiError");

async function createQuiz(teacherId, payload) {
  return Quiz.create({ ...payload, teacher: teacherId, status: "draft" });
}

async function updateQuiz({ quizId, teacherId, updates }) {
  const quiz = await Quiz.findOneAndUpdate({ _id: quizId, teacher: teacherId }, updates, { new: true, runValidators: true });
  if (!quiz) throw new ApiError(404, "Quiz not found");
  return quiz;
}

async function publishQuiz({ quizId, teacherId }) {
  const quiz = await Quiz.findOne({ _id: quizId, teacher: teacherId });
  if (!quiz) throw new ApiError(404, "Quiz not found");
  if (!quiz.questions.length) throw new ApiError(400, "Add at least one question before publishing");

  quiz.status = quiz.openAt && quiz.openAt > new Date() ? "scheduled" : "published";
  await quiz.save();
  return quiz;
}

async function deleteQuiz({ quizId, teacherId }) {
  const quiz = await Quiz.findOneAndDelete({ _id: quizId, teacher: teacherId });
  if (!quiz) throw new ApiError(404, "Quiz not found");
  await QuizAttempt.deleteMany({ quiz: quizId });
  return true;
}

async function listForTeacher(teacherId) {
  const quizzes = await Quiz.find({ teacher: teacherId }).sort({ createdAt: -1 });

  return Promise.all(quizzes.map(async (quiz) => {
    const attempts = await QuizAttempt.find({ quiz: quiz._id, status: "completed" });
    const totalStudents = await Student.countDocuments(
      quiz.grade && quiz.section ? { grade: quiz.grade, section: quiz.section } : {}
    );
    const avgScore = attempts.length
      ? Math.round(attempts.reduce((s, a) => s + (a.scorePercent || 0), 0) / attempts.length)
      : null;

    return { ...quiz.toObject(), completedCount: attempts.length, totalStudents, avgScore };
  }));
}

async function listForStudent(student) {
  const quizzes = await Quiz.find({
    status: { $in: ["published", "scheduled"] },
    $or: [{ grade: "" }, { grade: student.grade }],
  }).sort({ createdAt: -1 });

  return Promise.all(quizzes.map(async (quiz) => {
    const attempt = await QuizAttempt.findOne({ quiz: quiz._id, student: student._id });
    return { ...quiz.toObject(), myAttemptStatus: attempt ? attempt.status : "not_started", myScorePercent: attempt ? attempt.scorePercent : null };
  }));
}

function stripAnswers(quiz) {
  const obj = quiz.toObject ? quiz.toObject() : quiz;
  return {
    ...obj,
    questions: obj.questions.map((q) => ({
      _id: q._id, text: q.text, type: q.type,
      options: q.options.map((o) => ({ _id: o._id, text: o.text })),
      points: q.points,
    })),
  };
}

async function getForTeacher({ quizId, teacherId }) {
  const quiz = await Quiz.findOne({ _id: quizId, teacher: teacherId });
  if (!quiz) throw new ApiError(404, "Quiz not found");
  return quiz;
}

async function getForStudent(quizId) {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw new ApiError(404, "Quiz not found");
  if (quiz.status === "draft") throw new ApiError(403, "This quiz is not available yet");
  return stripAnswers(quiz);
}

async function startAttempt({ quizId, studentId }) {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw new ApiError(404, "Quiz not found");
  if (quiz.status !== "published") throw new ApiError(403, "This quiz is not open yet");

  const existing = await QuizAttempt.findOne({ quiz: quizId, student: studentId });
  if (existing) {
    if (existing.status === "completed" && !quiz.settings.allowRetake) {
      throw new ApiError(409, "You have already completed this quiz");
    }
    if (existing.status === "in_progress") return existing;
  }

  return QuizAttempt.create({ quiz: quizId, student: studentId });
}

async function submitAttempt({ attemptId, studentId, answers }) {
  const attempt = await QuizAttempt.findOne({ _id: attemptId, student: studentId });
  if (!attempt) throw new ApiError(404, "Quiz attempt not found");
  if (attempt.status === "completed") throw new ApiError(409, "This attempt was already submitted");

  const quiz = await Quiz.findById(attempt.quiz);
  if (!quiz) throw new ApiError(404, "Quiz not found");

  const questionMap = new Map(quiz.questions.map((q) => [String(q._id), q]));
  let totalPoints = 0;
  let earnedPoints = 0;

  const gradedAnswers = answers.map((ans) => {
    const question = questionMap.get(String(ans.questionId));
    if (!question) return null;

    totalPoints += question.points;
    let isCorrect = false;

    if (question.type === "short_answer") {
      isCorrect = (ans.shortAnswerText || "").trim().toLowerCase() === (question.correctShortAnswer || "").trim().toLowerCase();
    } else {
      isCorrect = question.correctOptionId && String(question.correctOptionId) === String(ans.selectedOptionId);
    }

    if (isCorrect) earnedPoints += question.points;

    return {
      question: question._id,
      selectedOptionId: ans.selectedOptionId || null,
      shortAnswerText: ans.shortAnswerText || "",
      isCorrect,
      pointsAwarded: isCorrect ? question.points : 0,
    };
  }).filter(Boolean);

  attempt.answers = gradedAnswers;
  attempt.scorePercent = totalPoints ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  attempt.status = "completed";
  attempt.completedAt = new Date();
  await attempt.save();

  return attempt;
}

async function getMyAttempt({ quizId, studentId }) {
  return QuizAttempt.findOne({ quiz: quizId, student: studentId });
}

async function getResults({ quizId, teacherId }) {
  const quiz = await Quiz.findOne({ _id: quizId, teacher: teacherId });
  if (!quiz) throw new ApiError(404, "Quiz not found");

  const attempts = await QuizAttempt.find({ quiz: quizId }).populate("student", "fullName studentId avatarInitials");
  const completed = attempts.filter((a) => a.status === "completed");

  const buckets = [
    { label: "0-59", min: 0, max: 59, count: 0 },
    { label: "60-69", min: 60, max: 69, count: 0 },
    { label: "70-79", min: 70, max: 79, count: 0 },
    { label: "80-89", min: 80, max: 89, count: 0 },
    { label: "90-100", min: 90, max: 100, count: 0 },
  ];
  completed.forEach((a) => {
    const bucket = buckets.find((b) => a.scorePercent >= b.min && a.scorePercent <= b.max);
    if (bucket) bucket.count += 1;
  });

  const questionStats = quiz.questions.map((q) => {
    const relevantAnswers = completed.flatMap((a) => a.answers.filter((ans) => String(ans.question) === String(q._id)));
    const correctCount = relevantAnswers.filter((a) => a.isCorrect).length;
    const correctRate = relevantAnswers.length ? Math.round((correctCount / relevantAnswers.length) * 100) : null;
    return { questionId: q._id, text: q.text, correctRate };
  });

  const weakestQuestions = questionStats.filter((q) => q.correctRate !== null).sort((a, b) => a.correctRate - b.correctRate).slice(0, 5);

  const averageScore = completed.length
    ? Math.round(completed.reduce((s, a) => s + a.scorePercent, 0) / completed.length)
    : null;

  const studentScores = attempts.map((a) => ({
    student: a.student,
    scorePercent: a.scorePercent,
    status: a.status,
    startedAt: a.startedAt,
    completedAt: a.completedAt,
    timeTakenSeconds: a.completedAt && a.startedAt ? Math.round((a.completedAt - a.startedAt) / 1000) : null,
  }));

  return { completedCount: completed.length, totalAttempts: attempts.length, averageScore, distribution: buckets, weakestQuestions, studentScores };
}

module.exports = {
  createQuiz, updateQuiz, publishQuiz, deleteQuiz, listForTeacher, listForStudent,
  getForTeacher, getForStudent, startAttempt, submitAttempt, getMyAttempt, getResults,
};
