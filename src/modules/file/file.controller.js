const asyncHandler = require("../../utils/asyncHandler");
const sendResponse = require("../../utils/apiResponse");
const service = require("./file.service");

const upload = asyncHandler(async (req, res) => {
  const record = await service.upload({
    teacherId: req.user._id,
    title: req.body.title,
    subject: req.body.subject,
    grade: req.body.grade,
    section: req.body.section,
    file: req.file,
  });
  sendResponse(res, 201, "File uploaded", record);
});

const list = asyncHandler(async (req, res) => {
  const files = await service.list({ subject: req.query.subject, fileType: req.query.fileType });
  sendResponse(res, 200, "Files", files);
});

const download = asyncHandler(async (req, res) => {
  const { record, fullPath } = await service.getFileForDownload(req.params.id);
  res.download(fullPath, record.originalFileName);
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id, req.user._id);
  sendResponse(res, 200, "File deleted", null);
});

module.exports = { upload, list, download, remove };
