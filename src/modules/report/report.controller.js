const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/apiResponse");
const service = require("./report.service");

const send = asyncHandler(async (req, res) => {
  const { studentId, period, include, teacherNote, sendMethod } = req.body;
  const report = await service.generateAndSend({
    teacherId: req.user._id, studentId, period, include, teacherNote, sendMethod,
  });
  sendResponse(res, 201, "Report sent", report);
});

const history = asyncHandler(async (req, res) => {
  const reports = await service.history(req.params.studentId);
  sendResponse(res, 200, "Report history", reports);
});

module.exports = { send, history };
