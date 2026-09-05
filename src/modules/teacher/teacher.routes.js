const router = require("express").Router();
const controller = require("./teacher.controller");
const { authenticate, authorize } = require("../../middleware/auth.middleware");

router.get(
  "/me/attendance-overview",
  authenticate,
  authorize("teacher"),
  controller.attendanceOverview
);

module.exports = router;
