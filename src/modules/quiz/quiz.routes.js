const router = require("express").Router();
const controller = require("./quiz.controller");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { requireFields } = require("../../middleware/validate.middleware");

// Teacher: builder CRUD
router.post(
  "/",
  authenticate,
  authorize("teacher"),
  requireFields(["title", "subject"]),
  controller.create
);
router.patch("/:id", authenticate, authorize("teacher"), controller.update);
router.post("/:id/publish", authenticate, authorize("teacher"), controller.publish);
router.delete("/:id", authenticate, authorize("teacher"), controller.remove);
router.get("/:id/results", authenticate, authorize("teacher"), controller.results);

// Shared: list + get one (behavior branches on role inside the controller)
router.get("/", authenticate, controller.list);
router.get("/:id", authenticate, controller.getOne);

// Student: taking a quiz
router.post("/:id/attempts", authenticate, authorize("student"), controller.startAttempt);
router.get("/:id/my-attempt", authenticate, authorize("student"), controller.myAttempt);
router.post(
  "/attempts/:attemptId/submit",
  authenticate,
  authorize("student"),
  requireFields(["answers"]),
  controller.submitAttempt
);

module.exports = router;
