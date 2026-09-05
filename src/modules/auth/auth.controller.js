const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/apiResponse");
const authService = require("./auth.service");

const studentSignup = asyncHandler(async (req, res) => {
  const result = await authService.signupStudent(req.body);
  sendResponse(res, 201, "Account created", result);
});

const studentLogin = asyncHandler(async (req, res) => {
  const result = await authService.loginStudent(req.body);
  sendResponse(res, 200, "Logged in", result);
});

const teacherLogin = asyncHandler(async (req, res) => {
  const result = await authService.loginTeacher(req.body);
  sendResponse(res, 200, "Logged in", result);
});

const me = asyncHandler(async (req, res) => {
  const user =
    req.userRole === "teacher"
      ? authService.sanitizeTeacher(req.user)
      : authService.sanitizeStudent(req.user);
  sendResponse(res, 200, "Current user", user);
});

module.exports = { studentSignup, studentLogin, teacherLogin, me };
