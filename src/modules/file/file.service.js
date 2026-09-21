const path = require("path");
const fs = require("fs");
const FileResource = require("../../DB/models/file.model");
const ApiError = require("../../utils/apiError");

function inferFileType(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  if (ext === ".pdf") return "pdf";
  if ([".doc", ".docx"].includes(ext)) return "doc";
  if ([".ppt", ".pptx"].includes(ext)) return "ppt";
  return "other";
}

async function upload({ teacherId, title, subject, grade, section, file }) {
  if (!file) throw new ApiError(400, "No file was uploaded");

  return FileResource.create({
    title, subject, grade, section, teacher: teacherId,
    fileType: inferFileType(file.originalname),
    storedFileName: file.filename,
    originalFileName: file.originalname,
    sizeBytes: file.size,
  });
}

async function list({ subject, fileType }) {
  const filter = {};
  if (subject) filter.subject = subject;
  if (fileType) filter.fileType = fileType;
  return FileResource.find(filter).sort({ createdAt: -1 });
}

async function getFileForDownload(fileId) {
  const record = await FileResource.findById(fileId);
  if (!record) throw new ApiError(404, "File not found");

  const fullPath = path.join(__dirname, "..", "..", "..", "uploads", record.storedFileName);
  if (!fs.existsSync(fullPath)) throw new ApiError(410, "File is missing from storage");

  return { record, fullPath };
}

async function remove(fileId, teacherId) {
  const record = await FileResource.findOne({ _id: fileId, teacher: teacherId });
  if (!record) throw new ApiError(404, "File not found");

  const fullPath = path.join(__dirname, "..", "..", "..", "uploads", record.storedFileName);
  fs.existsSync(fullPath) && fs.unlinkSync(fullPath);

  await record.deleteOne();
  return true;
}

module.exports = { upload, list, getFileForDownload, remove };
