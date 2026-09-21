const Attendance = require("../../DB/models/attendance.model");
const CheckinSession = require("../../DB/models/checkinSession.model");
const ApiError = require("../../utils/apiError");
const { createCheckInSession } = require("../../utils/qrService");

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function openSession({ teacherId, subject }) {
  const ttlSeconds = Number(process.env.QR_SESSION_TTL_SECONDS) || 900;
  const { sessionToken, qrDataUrl } = await createCheckInSession();

  await CheckinSession.create({
    sessionToken, teacher: teacherId, subject,
    expiresAt: new Date(Date.now() + ttlSeconds * 1000),
  });

  return { sessionToken, qrDataUrl, expiresInSeconds: ttlSeconds };
}

async function checkIn({ studentId, sessionToken }) {
  const session = await CheckinSession.findOne({ sessionToken });
  if (!session) throw new ApiError(400, "Invalid QR code");
  if (session.expiresAt < new Date()) throw new ApiError(400, "This QR code has expired");

  const now = new Date();
  const date = startOfDay(now);
  const minutesSinceOpen = (now - session.createdAt) / 60000;
  const status = minutesSinceOpen > 10 ? "late" : "present";

  const record = await Attendance.findOneAndUpdate(
    { student: studentId, subject: session.subject, date },
    { student: studentId, teacher: session.teacher, subject: session.subject, date, checkInTime: now, status },
    { upsert: true, new: true }
  );

  return record;
}

async function getStudentHistory({ studentId, subject, from, to }) {
  const filter = { student: studentId };
  if (subject) filter.subject = subject;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  return Attendance.find(filter).sort({ date: -1 });
}

async function getStudentStats(studentId) {
  const records = await Attendance.find({ student: studentId });
  if (!records.length) return { attendanceRate: 0, presentDays: 0, totalDays: 0, streak: 0 };

  const presentDays = records.filter((r) => r.status !== "absent").length;
  const attendanceRate = Math.round((presentDays / records.length) * 100);

  const sorted = [...records].sort((a, b) => b.date - a.date);
  let streak = 0;
  for (const r of sorted) {
    if (r.status === "absent") break;
    streak += 1;
  }

  return { attendanceRate, presentDays, totalDays: records.length, streak };
}

async function getClassRoster({ teacherId, subject, date }) {
  const day = startOfDay(date || new Date());
  const records = await Attendance.find({ teacher: teacherId, subject, date: day }).populate(
    "student", "fullName studentId avatarInitials"
  );
  return records;
}

async function updateStatus({ attendanceId, status }) {
  const record = await Attendance.findByIdAndUpdate(attendanceId, { status }, { new: true });
  if (!record) throw new ApiError(404, "Attendance record not found");
  return record;
}

module.exports = { openSession, checkIn, getStudentHistory, getStudentStats, getClassRoster, updateStatus };
