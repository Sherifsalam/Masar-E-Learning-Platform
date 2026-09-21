const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/apiResponse");
const service = require("./teacher.service");

const attendanceOverview = asyncHandler(async (req, res) => {
  const { subject, grade, section, date } = req.query;
  const overview = await service.getAttendanceOverview({
    teacherId: req.user._id, subject, grade, section, date,
  });
  sendResponse(res, 200, "Attendance overview", overview);
});

module.exports = { attendanceOverview };
