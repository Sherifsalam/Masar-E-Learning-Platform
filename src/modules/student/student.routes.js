const router = require("express").Router();
const controller = require("./student.controller");
const { authenticate, authorize } = require("../../middleware/auth.middleware");

router.get("/me/dashboard", authenticate, authorize("student"), controller.dashboard);
router.get("/", authenticate, authorize("teacher"), controller.search);
router.get("/:id", authenticate, authorize("teacher"), controller.getProfile);

module.exports = router;
