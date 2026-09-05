const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/apiResponse");
const service = require("./lecture.service");

const create = asyncHandler(async (req, res) => {
  const lecture = await service.createLecture(req.user._id, req.body);
  sendResponse(res, 201, "Lecture created", lecture);
});

const list = asyncHandler(async (req, res) => {
  const studentId = req.userRole === "student" ? req.user._id : req.query.studentId;
  const lectures = await service.listForStudent({ studentId, subject: req.query.subject });
  sendResponse(res, 200, "Lectures", lectures);
});

const getOne = asyncHandler(async (req, res) => {
  const studentId = req.userRole === "student" ? req.user._id : undefined;
  const lecture = await service.getById(req.params.id, studentId);
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

module.exports = { create, list, getOne, updateProgress, continueWatching };
