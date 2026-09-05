const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/apiResponse");
const service = require("./quiz.service");

const create = asyncHandler(async (req, res) => {
  const quiz = await service.createQuiz(req.user._id, req.body);
  sendResponse(res, 201, "Quiz draft created", quiz);
});

const update = asyncHandler(async (req, res) => {
  const quiz = await service.updateQuiz({
    quizId: req.params.id,
    teacherId: req.user._id,
    updates: req.body,
  });
  sendResponse(res, 200, "Quiz updated", quiz);
});

const publish = asyncHandler(async (req, res) => {
  const quiz = await service.publishQuiz({ quizId: req.params.id, teacherId: req.user._id });
  sendResponse(res, 200, "Quiz published", quiz);
});

const remove = asyncHandler(async (req, res) => {
  await service.deleteQuiz({ quizId: req.params.id, teacherId: req.user._id });
  sendResponse(res, 200, "Quiz deleted", null);
});

const list = asyncHandler(async (req, res) => {
  const quizzes =
    req.userRole === "teacher"
      ? await service.listForTeacher(req.user._id)
      : await service.listForStudent(req.user);
  sendResponse(res, 200, "Quizzes", quizzes);
});

const getOne = asyncHandler(async (req, res) => {
  const quiz =
    req.userRole === "teacher"
      ? await service.getForTeacher({ quizId: req.params.id, teacherId: req.user._id })
      : await service.getForStudent(req.params.id);
  sendResponse(res, 200, "Quiz", quiz);
});

const startAttempt = asyncHandler(async (req, res) => {
  const attempt = await service.startAttempt({
    quizId: req.params.id,
    studentId: req.user._id,
  });
  sendResponse(res, 201, "Attempt started", attempt);
});

const submitAttempt = asyncHandler(async (req, res) => {
  const attempt = await service.submitAttempt({
    attemptId: req.params.attemptId,
    studentId: req.user._id,
    answers: req.body.answers,
  });
  sendResponse(res, 200, "Quiz submitted", attempt);
});

const myAttempt = asyncHandler(async (req, res) => {
  const attempt = await service.getMyAttempt({
    quizId: req.params.id,
    studentId: req.user._id,
  });
  sendResponse(res, 200, "My attempt", attempt);
});

const results = asyncHandler(async (req, res) => {
  const data = await service.getResults({ quizId: req.params.id, teacherId: req.user._id });
  sendResponse(res, 200, "Quiz results", data);
});

module.exports = {
  create,
  update,
  publish,
  remove,
  list,
  getOne,
  startAttempt,
  submitAttempt,
  myAttempt,
  results,
};
