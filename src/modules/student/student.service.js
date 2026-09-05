const Student = require("../../DB/models/student.model");
const Attendance = require("../../DB/models/attendance.model");
const QuizAttempt = require("../../DB/models/quizAttempt.model");
const LectureProgress = require("../../DB/models/lectureProgress.model");
const ApiError = require("../../utils/apiError");
const attendanceService = require("../attendance/attendance.service");

async function search({ query, grade, section }) {
  const filter = {};
  if (grade) filter.grade = grade;
  if (section) filter.section = section;
  if (query) filter.$text = { $search: query };
  return Student.find(filter).limit(50).sort({ fullName: 1 });
}

// Full profile used by the teacher "student detail" screen: attendance bars,
// recent quiz scores, and parent/guardian info.
async function getFullProfile(studentId) {
  const student = await Student.findById(studentId);
  if (!student) throw new ApiError(404, "Student not found");

  const stats = await attendanceService.getStudentStats(studentId);

  const last8Weeks = await getWeeklyAttendance(studentId, 8);

  const attempts = await QuizAttempt.find({ student: studentId, status: "completed" })
    .sort({ completedAt: -1 })
    .limit(5)
    .populate("quiz", "title");

  const recentQuizScores = attempts.map((a) => ({
    quizTitle: a.quiz ? a.quiz.title : "Untitled quiz",
    scorePercent: a.scorePercent,
  }));

  const overallAverage = recentQuizScores.length
    ? Math.round(
        recentQuizScores.reduce((sum, q) => sum + (q.scorePercent || 0), 0) /
          recentQuizScores.length
      )
    : null;

  return {
    student,
    attendance: stats,
    attendanceLast8Weeks: last8Weeks,
    recentQuizScores,
    overallAverage,
  };
}

async function getWeeklyAttendance(studentId, weeks) {
  const records = await Attendance.find({ student: studentId }).sort({ date: 1 });
  if (!records.length) return [];

  const byWeek = new Map();
  records.forEach((r) => {
    const weekStart = new Date(r.date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    if (!byWeek.has(key)) byWeek.set(key, []);
    byWeek.get(key).push(r);
  });

  const weekKeys = [...byWeek.keys()].slice(-weeks);
  return weekKeys.map((key) => {
    const recs = byWeek.get(key);
    const presentCount = recs.filter((r) => r.status !== "absent").length;
    return { week: key, attendanceRate: Math.round((presentCount / recs.length) * 100) };
  });
}

// Home-screen summary: attendance rate, lectures watched, saved files count,
// quizzes due — mirrors the four stat cards on the student dashboard.
async function getDashboardSummary(studentId) {
  const attendance = await attendanceService.getStudentStats(studentId);
  const lecturesWatched = await LectureProgress.countDocuments({
    student: studentId,
    watchedPercent: { $gte: 100 },
  });

  return { attendance, lecturesWatched };
}

module.exports = { search, getFullProfile, getDashboardSummary };
