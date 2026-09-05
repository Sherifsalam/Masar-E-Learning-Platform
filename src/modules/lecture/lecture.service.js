const Lecture = require("../../DB/models/lecture.model");
const LectureProgress = require("../../DB/models/lectureProgress.model");
const ApiError = require("../../utils/apiError");

async function createLecture(teacherId, payload) {
  return Lecture.create({ ...payload, teacher: teacherId });
}

async function listForStudent({ studentId, subject }) {
  const filter = {};
  if (subject) filter.subject = subject;
  const lectures = await Lecture.find(filter).sort({ createdAt: -1 });

  const progressDocs = await LectureProgress.find({ student: studentId });
  const progressMap = new Map(progressDocs.map((p) => [String(p.lecture), p.watchedPercent]));

  return lectures.map((lec) => ({
    ...lec.toObject(),
    watchedPercent: progressMap.get(String(lec._id)) || 0,
  }));
}

async function getById(lectureId, studentId) {
  const lecture = await Lecture.findById(lectureId);
  if (!lecture) throw new ApiError(404, "Lecture not found");

  let watchedPercent = 0;
  if (studentId) {
    const progress = await LectureProgress.findOne({ student: studentId, lecture: lectureId });
    watchedPercent = progress ? progress.watchedPercent : 0;
  }
  return { ...lecture.toObject(), watchedPercent };
}

async function updateProgress({ studentId, lectureId, watchedPercent }) {
  return LectureProgress.findOneAndUpdate(
    { student: studentId, lecture: lectureId },
    { watchedPercent, lastWatchedAt: new Date() },
    { upsert: true, new: true }
  );
}

async function continueWatching(studentId, limit = 5) {
  return LectureProgress.find({
    student: studentId,
    watchedPercent: { $gt: 0, $lt: 100 },
  })
    .sort({ lastWatchedAt: -1 })
    .limit(limit)
    .populate("lecture");
}

module.exports = { createLecture, listForStudent, getById, updateProgress, continueWatching };
