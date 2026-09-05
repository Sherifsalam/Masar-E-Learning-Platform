const Report = require("../../DB/models/report.model");
const Student = require("../../DB/models/student.model");
const Teacher = require("../../DB/models/teacher.model");
const ApiError = require("../../utils/apiError");
const { sendEmail } = require("../../utils/emailService");
const attendanceService = require("../attendance/attendance.service");
const studentService = require("../student/student.service");

function renderReportHtml({ student, teacher, period, snapshot, teacherNote, include }) {
  return `
    <h2>Monthly progress report</h2>
    <p>${student.fullName} · ${student.grade}, ${student.section} · ${period}</p>
    ${include.attendance ? `<h4>Attendance</h4><p>${snapshot.attendance.presentDays}/${snapshot.attendance.totalDays} days present (${snapshot.attendance.attendanceRate}%)</p>` : ""}
    ${include.grades ? `<h4>Grades & quizzes</h4><p>Overall average: ${snapshot.overallAverage ?? "N/A"}%</p>` : ""}
    ${include.lectureEngagement ? `<h4>Lecture engagement</h4><p>${snapshot.lecturesWatched} lectures completed</p>` : ""}
    ${teacherNote ? `<h4>Note from ${teacher.fullName}</h4><p>${teacherNote}</p>` : ""}
  `;
}

async function generateAndSend({ teacherId, studentId, period, include, teacherNote, sendMethod }) {
  const student = await Student.findById(studentId);
  const teacher = await Teacher.findById(teacherId);
  if (!student) throw new ApiError(404, "Student not found");

  const attendance = await attendanceService.getStudentStats(studentId);
  const dashboard = await studentService.getDashboardSummary(studentId);
  const { recentQuizScores, overallAverage } = await studentService.getFullProfile(studentId);

  const snapshot = {
    attendance,
    lecturesWatched: dashboard.lecturesWatched,
    recentQuizScores,
    overallAverage,
  };

  const report = await Report.create({
    student: studentId,
    teacher: teacherId,
    period,
    include,
    teacherNote,
    sendMethod,
    snapshot,
  });

  if (sendMethod === "email" && student.parentEmail) {
    await sendEmail({
      to: student.parentEmail,
      subject: `Progress report — ${student.fullName} (${period})`,
      html: renderReportHtml({ student, teacher, period, snapshot, teacherNote, include }),
    });
  }
  // sms / whatsapp delivery would plug in a provider (e.g. Twilio) here.

  return report;
}

async function history(studentId) {
  return Report.find({ student: studentId }).sort({ createdAt: -1 });
}

module.exports = { generateAndSend, history };
