const Student = require("../../DB/models/student.model");
const Attendance = require("../../DB/models/attendance.model");

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Powers the four stat cards on the teacher attendance-review screen:
// total students, present / absent / late counts for the selected day.
async function getAttendanceOverview({ teacherId, subject, grade, section, date }) {
  const day = startOfDay(date || new Date());

  const studentFilter = {};
  if (grade) studentFilter.grade = grade;
  if (section) studentFilter.section = section;
  const totalStudents = await Student.countDocuments(studentFilter);

  const records = await Attendance.find({ teacher: teacherId, subject, date: day });
  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const absent = totalStudents - present - late;

  return { totalStudents, present, absent: Math.max(absent, 0), late };
}

module.exports = { getAttendanceOverview };
