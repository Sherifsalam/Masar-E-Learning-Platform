const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/apiResponse");
const service = require("./attendance.service");

const openSession = asyncHandler(async (req, res) => {
  const result = await service.openSession({
    teacherId: req.user._id,
    subject: req.body.subject,
  });
  sendResponse(res, 201, "Check-in session opened", result);
});

const checkIn = asyncHandler(async (req, res) => {
  const record = await service.checkIn({
    studentId: req.user._id,
    sessionToken: req.body.sessionToken,
  });
  sendResponse(res, 200, "Checked in successfully", record);
});

const myHistory = asyncHandler(async (req, res) => {
  const { subject, from, to } = req.query;
  const records = await service.getStudentHistory({
    studentId: req.user._id,
    subject,
    from,
    to,
  });
  sendResponse(res, 200, "Attendance history", records);
});

const myStats = asyncHandler(async (req, res) => {
  const stats = await service.getStudentStats(req.user._id);
  sendResponse(res, 200, "Attendance stats", stats);
});

const classRoster = asyncHandler(async (req, res) => {
  const { subject, date } = req.query;
  const roster = await service.getClassRoster({
    teacherId: req.user._id,
    subject,
    date,
  });
  sendResponse(res, 200, "Class roster", roster);
});

const updateStatus = asyncHandler(async (req, res) => {
  const record = await service.updateStatus({
    attendanceId: req.params.id,
    status: req.body.status,
  });
  sendResponse(res, 200, "Attendance updated", record);
});

module.exports = { openSession, checkIn, myHistory, myStats, classRoster, updateStatus };
