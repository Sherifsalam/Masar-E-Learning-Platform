const router = require("express").Router();
const controller = require("./auth.controller");
const { requireFields } = require("../../middleware/validate.middleware");
const { authenticate } = require("../../middleware/auth.middleware");

router.post(
  "/student/signup",
  requireFields(["fullName", "studentId", "email", "grade", "section", "password"]),
  controller.studentSignup
);
router.post("/student/login", requireFields(["identifier", "password"]), controller.studentLogin);
router.post("/teacher/login", requireFields(["email", "password"]), controller.teacherLogin);
router.get("/me", authenticate, controller.me);

module.exports = router;
