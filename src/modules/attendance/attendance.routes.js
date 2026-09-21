const router = require("express").Router();
const controller = require("./attendance.controller");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { requireFields } = require("../../middleware/validate.middleware");

router.post("/session", authenticate, authorize("teacher"), requireFields(["subject"]), controller.openSession);
router.post("/check-in", authenticate, authorize("student"), requireFields(["sessionToken"]), controller.checkIn);
router.get("/me/history", authenticate, authorize("student"), controller.myHistory);
router.get("/me/stats", authenticate, authorize("student"), controller.myStats);
router.get("/roster", authenticate, authorize("teacher"), controller.classRoster);
router.patch("/:id", authenticate, authorize("teacher"), controller.updateStatus);

module.exports = router;
