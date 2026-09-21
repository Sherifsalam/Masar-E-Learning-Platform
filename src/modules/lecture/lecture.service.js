const Lecture = require("../../DB/models/lecture.model");
const LectureProgress = require("../../DB/models/lectureProgress.model");
const LectureAccessCode = require("../../DB/models/lectureAccessCode.model");
const ApiError = require("../../utils/apiError");
const { generateCode, normalizeCode } = require("../../utils/accessCodeUtils");

async function createLecture(teacherId, payload) {
  return Lecture.create({ ...payload, teacher: teacherId });
}

/** Lecture ids this student has unlocked with a paid code. */
async function unlockedLectureIds(studentId) {
  if (!studentId) return new Set();
  const codes = await LectureAccessCode.find({ redeemedBy: studentId }).select("lecture");
  return new Set(codes.map((c) => String(c.lecture)));
}

/**
 * Strips the video URL from a lecture the viewer has not paid for.
 *
 * The URL is removed server-side rather than hidden in the UI: if it shipped
 * with the response, the paywall would be worth nothing to anyone who opens
 * the network tab.
 */
function present(lecture, { unlocked, watchedPercent }) {
  const obj = lecture.toObject ? lecture.toObject() : { ...lecture };
  if (!unlocked) delete obj.videoUrl;
  return { ...obj, unlocked, watchedPercent: unlocked ? watchedPercent : 0 };
}

async function listForStudent({ studentId, subject, viewerRole }) {
  const filter = {};
  if (subject) filter.subject = subject;
  const lectures = await Lecture.find(filter).sort({ createdAt: -1 });

  // Teachers own the material, so nothing is locked for them.
  const teacherView = viewerRole === "teacher";
  const unlocked = teacherView ? null : await unlockedLectureIds(studentId);

  const progressDocs = studentId ? await LectureProgress.find({ student: studentId }) : [];
  const progressMap = new Map(progressDocs.map((p) => [String(p.lecture), p.watchedPercent]));

  return lectures.map((lec) =>
    present(lec, {
      unlocked: teacherView || unlocked.has(String(lec._id)),
      watchedPercent: progressMap.get(String(lec._id)) || 0,
    })
  );
}

async function getById(lectureId, studentId, viewerRole) {
  const lecture = await Lecture.findById(lectureId);
  if (!lecture) throw new ApiError(404, "Lecture not found");

  if (viewerRole === "teacher") {
    return present(lecture, { unlocked: true, watchedPercent: 0 });
  }

  const unlocked = await hasAccess(studentId, lectureId);
  if (!unlocked) {
    throw new ApiError(403, "This lecture is locked — enter the access code you received at the centre");
  }

  const progress = await LectureProgress.findOne({ student: studentId, lecture: lectureId });
  return present(lecture, { unlocked: true, watchedPercent: progress ? progress.watchedPercent : 0 });
}

async function hasAccess(studentId, lectureId) {
  if (!studentId) return false;
  const code = await LectureAccessCode.findOne({ redeemedBy: studentId, lecture: lectureId });
  return !!code;
}

async function updateProgress({ studentId, lectureId, watchedPercent }) {
  if (!(await hasAccess(studentId, lectureId))) {
    throw new ApiError(403, "This lecture is locked — enter its access code first");
  }

  return LectureProgress.findOneAndUpdate(
    { student: studentId, lecture: lectureId },
    { watchedPercent, lastWatchedAt: new Date() },
    { upsert: true, new: true }
  );
}

async function continueWatching(studentId, limit = 5) {
  const progress = await LectureProgress.find({
    student: studentId,
    watchedPercent: { $gt: 0, $lt: 100 },
  })
    .sort({ lastWatchedAt: -1 })
    .limit(limit)
    .populate("lecture");

  // Access can be revoked, so re-check rather than trusting old progress rows.
  const unlocked = await unlockedLectureIds(studentId);
  return progress.filter((p) => p.lecture && unlocked.has(String(p.lecture._id)));
}

/**
 * Redeems a prepaid code and unlocks its lecture for this student.
 *
 * Deliberately distinguishes "already yours" from "already used by someone
 * else": the first is a student re-entering their own code, which should feel
 * like success, not an error.
 */
async function redeemCode({ studentId, code }) {
  const normalized = normalizeCode(code);
  if (!normalized) throw new ApiError(400, "Enter the access code from your receipt");

  const record = await LectureAccessCode.findOne({ code: normalized });
  if (!record) throw new ApiError(404, "That code is not valid — check the letters and try again");

  if (record.redeemedBy && String(record.redeemedBy) !== String(studentId)) {
    throw new ApiError(409, "That code has already been used on another account");
  }

  const alreadyOwned = !!record.redeemedBy;

  if (!alreadyOwned) {
    record.redeemedBy = studentId;
    record.redeemedAt = new Date();
    await record.save();
  }

  const lecture = await Lecture.findById(record.lecture);
  if (!lecture) throw new ApiError(404, "The lecture for this code no longer exists");

  const progress = await LectureProgress.findOne({ student: studentId, lecture: lecture._id });

  return {
    alreadyOwned,
    lecture: present(lecture, {
      unlocked: true,
      watchedPercent: progress ? progress.watchedPercent : 0,
    }),
  };
}

/** Issues `count` fresh codes for a lecture, for the desk to sell. */
async function generateCodes({ lectureId, teacherId, count = 1, note = "" }) {
  const lecture = await Lecture.findOne({ _id: lectureId, teacher: teacherId });
  if (!lecture) throw new ApiError(404, "Lecture not found");

  const total = Math.min(Math.max(Number(count) || 1, 1), 100);
  const created = [];

  for (let i = 0; i < total; i += 1) {
    // Retry on the (very unlikely) unique-index collision rather than failing
    // the whole batch.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        created.push(
          await LectureAccessCode.create({
            code: generateCode(),
            lecture: lectureId,
            createdBy: teacherId,
            note,
          })
        );
        break;
      } catch (err) {
        if (err.code !== 11000 || attempt === 4) throw err;
      }
    }
  }

  return created;
}

async function listCodes({ lectureId, teacherId }) {
  const lecture = await Lecture.findOne({ _id: lectureId, teacher: teacherId });
  if (!lecture) throw new ApiError(404, "Lecture not found");

  return LectureAccessCode.find({ lecture: lectureId })
    .sort({ createdAt: -1 })
    .populate("redeemedBy", "fullName studentId");
}

module.exports = {
  createLecture,
  listForStudent,
  getById,
  updateProgress,
  continueWatching,
  redeemCode,
  generateCodes,
  listCodes,
  hasAccess,
};
