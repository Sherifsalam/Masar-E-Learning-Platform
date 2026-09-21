const router = require("express").Router();
const controller = require("./file.controller");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const uploadMiddleware = require("../../middleware/upload.middleware");

router.post("/", authenticate, authorize("teacher"), uploadMiddleware.single("file"), controller.upload);
router.get("/", authenticate, controller.list);
router.get("/:id/download", authenticate, controller.download);
router.delete("/:id", authenticate, authorize("teacher"), controller.remove);

module.exports = router;
