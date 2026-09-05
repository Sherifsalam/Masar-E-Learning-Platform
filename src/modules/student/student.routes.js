const router = require("express").Router();
const controller = require("./student.controller");
const { authenticate, authorize } = require("../../middleware/auth.middleware");

// Student: own dashboard summary
router.get("/me/dashboard", authenticate, authorize("student"), controller.dashboard);

// Teacher: search/lookup roster + full student profile
router.get("/", authenticate, authorize("teacher"), controller.search);
router.get("/:id", authenticate, authorize("teacher"), controller.getProfile);

module.exports = router;
