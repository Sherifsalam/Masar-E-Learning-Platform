const router = require("express").Router();
const controller = require("./attendance.controller");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { requireFields } = require("../../middleware/validate.middleware");

// Teacher: open a QR session for a class
router.post(
  "/session",
  authenticate,
  authorize("teacher"),
  requireFields(["subject"]),
  controller.openSession
);

// Student: scan/submit the QR session token to check in
router.post(
  "/check-in",
  authenticate,
  authorize("student"),
  requireFields(["sessionToken"]),
  controller.checkIn
);

// Student: own attendance history + stats (used on the home dashboard)
router.get("/me/history", authenticate, authorize("student"), controller.myHistory);
router.get("/me/stats", authenticate, authorize("student"), controller.myStats);

// Teacher: class roster for a subject/date + manual status override
router.get("/roster", authenticate, authorize("teacher"), controller.classRoster);
router.patch("/:id", authenticate, authorize("teacher"), controller.updateStatus);

module.exports = router;
