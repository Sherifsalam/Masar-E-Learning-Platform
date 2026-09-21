const router = require("express").Router();
const controller = require("./lecture.controller");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { requireFields } = require("../../middleware/validate.middleware");

router.post("/", authenticate, authorize("teacher"), requireFields(["title", "subject", "videoUrl", "durationMinutes"]), controller.create);
router.get("/", authenticate, controller.list);
router.get("/continue-watching", authenticate, authorize("student"), controller.continueWatching);

// Prepaid access codes: students redeem, teachers issue and audit.
router.post("/redeem", authenticate, authorize("student"), requireFields(["code"]), controller.redeem);
router.post("/:id/codes", authenticate, authorize("teacher"), controller.createCodes);
router.get("/:id/codes", authenticate, authorize("teacher"), controller.listCodes);

router.get("/:id", authenticate, controller.getOne);
router.patch("/:id/progress", authenticate, authorize("student"), requireFields(["watchedPercent"]), controller.updateProgress);

module.exports = router;
