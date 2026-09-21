const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/apiResponse");
const service = require("./lecture.service");

const create = asyncHandler(async (req, res) => {
  const lecture = await service.createLecture(req.user._id, req.body);
  sendResponse(res, 201, "Lecture created", lecture);
});

const list = asyncHandler(async (req, res) => {
  const studentId = req.userRole === "student" ? req.user._id : req.query.studentId;
  const lectures = await service.listForStudent({
    studentId,
    subject: req.query.subject,
    viewerRole: req.userRole,
  });
  sendResponse(res, 200, "Lectures", lectures);
});

const getOne = asyncHandler(async (req, res) => {
  const studentId = req.userRole === "student" ? req.user._id : undefined;
  const lecture = await service.getById(req.params.id, studentId, req.userRole);
  sendResponse(res, 200, "Lecture", lecture);
});

const updateProgress = asyncHandler(async (req, res) => {
  const progress = await service.updateProgress({
    studentId: req.user._id,
    lectureId: req.params.id,
    watchedPercent: req.body.watchedPercent,
  });
  sendResponse(res, 200, "Progress updated", progress);
});

const continueWatching = asyncHandler(async (req, res) => {
  const items = await service.continueWatching(req.user._id);
  sendResponse(res, 200, "Continue watching", items);
});

const redeem = asyncHandler(async (req, res) => {
  const result = await service.redeemCode({ studentId: req.user._id, code: req.body.code });
  sendResponse(
    res,
    200,
    result.alreadyOwned ? "You already unlocked this lecture" : "Lecture unlocked",
    result
  );
});

const createCodes = asyncHandler(async (req, res) => {
  const codes = await service.generateCodes({
    lectureId: req.params.id,
    teacherId: req.user._id,
    count: req.body.count,
    note: req.body.note,
  });
  sendResponse(res, 201, `${codes.length} access code(s) created`, codes);
});

const listCodes = asyncHandler(async (req, res) => {
  const codes = await service.listCodes({ lectureId: req.params.id, teacherId: req.user._id });
  sendResponse(res, 200, "Access codes", codes);
});

module.exports = {
  create,
  list,
  getOne,
  updateProgress,
  continueWatching,
  redeem,
  createCodes,
  listCodes,
};
