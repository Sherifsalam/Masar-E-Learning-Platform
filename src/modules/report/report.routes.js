const router = require("express").Router();
const controller = require("./report.controller");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const { requireFields } = require("../../middleware/validate.middleware");

router.post("/", authenticate, authorize("teacher"), requireFields(["studentId", "period", "sendMethod"]), controller.send);
router.get("/:studentId", authenticate, authorize("teacher"), controller.history);

module.exports = router;
