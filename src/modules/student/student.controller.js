const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/apiResponse");
const service = require("./student.service");

const search = asyncHandler(async (req, res) => {
  const { q, grade, section } = req.query;
  const students = await service.search({ query: q, grade, section });
  sendResponse(res, 200, "Students", students);
});

const getProfile = asyncHandler(async (req, res) => {
  const profile = await service.getFullProfile(req.params.id);
  sendResponse(res, 200, "Student profile", profile);
});

const dashboard = asyncHandler(async (req, res) => {
  const summary = await service.getDashboardSummary(req.user._id);
  sendResponse(res, 200, "Dashboard summary", summary);
});

module.exports = { search, getProfile, dashboard };
