/**
 * Seeds a demo teacher, student, lecture and quiz so the frontend has
 * something to talk to on a fresh database.
 *
 *   npm run seed
 *
 * Safe to re-run: every record is upserted by its natural key.
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const connectDB = require("../src/DB/connection");
const Teacher = require("../src/DB/models/teacher.model");
const Student = require("../src/DB/models/student.model");
const Lecture = require("../src/DB/models/lecture.model");
const Quiz = require("../src/DB/models/quiz.model");
const LectureAccessCode = require("../src/DB/models/lectureAccessCode.model");

// Stand-in for real lecture recordings until the centre uploads its own.
const DUMMY_VIDEO_URL = "https://youtu.be/4IlVkxdJGWc?si=nRqz62xObDgAz1cS";

const TEACHER = { email: "s.hassan@school.edu", password: "Teacher123!" };
const STUDENT = { email: "nour.ahmed@school.edu", studentId: "22-10453", password: "Student123!" };

async function seed() {
  await connectDB();

  const teacher = await Teacher.findOneAndUpdate(
    { email: TEACHER.email },
    {
      fullName: "Sara Hassan",
      email: TEACHER.email,
      password: await bcrypt.hash(TEACHER.password, 10),
      subject: "Biology 101",
      avatarInitials: "SH",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const students = [
    { fullName: "Nour Ahmed", studentId: "22-10453", email: STUDENT.email, initials: "NA" },
    { fullName: "Khaled Mostafa", studentId: "22-10412", email: "khaled.mostafa@school.edu", initials: "KM" },
    { fullName: "Yasmin Saeed", studentId: "22-10488", email: "yasmin.saeed@school.edu", initials: "YS" },
    { fullName: "Omar Tarek", studentId: "22-10401", email: "omar.tarek@school.edu", initials: "OT" },
  ];

  const hashed = await bcrypt.hash(STUDENT.password, 10);
  for (const s of students) {
    await Student.findOneAndUpdate(
      { studentId: s.studentId },
      {
        fullName: s.fullName,
        studentId: s.studentId,
        email: s.email,
        password: hashed,
        grade: "Grade 10",
        section: "Section B",
        parentName: "Parent / guardian",
        parentContact: "+20 100 123 4567",
        parentEmail: "parent@example.com",
        avatarInitials: s.initials,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const lectures = [
    { title: "Cell division — mitosis vs meiosis", subject: "Biology 101", durationMinutes: 38, thumbnailColor: "#2952E3", prefix: "CDNA" },
    { title: "Photosynthesis in depth", subject: "Biology 101", durationMinutes: 41, thumbnailColor: "#2952E3", prefix: "PHTS" },
    { title: "Newton's laws — worked examples", subject: "Physics", durationMinutes: 44, thumbnailColor: "#FF7A45", prefix: "NEWT" },
    { title: "Quadratic equations — full review", subject: "Math", durationMinutes: 52, thumbnailColor: "#1F9D63", prefix: "QDRT" },
  ];

  const issued = [];

  for (const { prefix, ...l } of lectures) {
    const lecture = await Lecture.findOneAndUpdate(
      { title: l.title },
      {
        ...l,
        teacher: teacher._id,
        videoUrl: DUMMY_VIDEO_URL,
        grade: "Grade 10",
        section: "Section B",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Fixed, readable codes so the unlock flow can be tested by hand. Real
    // codes are random — see generateCodes() in the lecture service.
    const codes = [`${prefix}-2345`, `${prefix}-2346`, `${prefix}-2347`];
    for (const code of codes) {
      await LectureAccessCode.findOneAndUpdate(
        { code },
        {
          code,
          lecture: lecture._id,
          createdBy: teacher._id,
          note: "Seeded demo code",
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    issued.push({ title: lecture.title, codes });
  }

  const quizTitle = "Cell division — chapter check";
  const existingQuiz = await Quiz.findOne({ title: quizTitle, teacher: teacher._id });
  if (!existingQuiz) {
    const quiz = new Quiz({
      title: quizTitle,
      subject: "Biology 101",
      teacher: teacher._id,
      grade: "Grade 10",
      section: "Section B",
      durationMinutes: 15,
      status: "published",
      questions: [
        {
          text: "A dominant gene is one that:",
          type: "mcq",
          options: [
            { text: "Is expressed even when only one copy is present" },
            { text: "Is only expressed when two copies are present" },
            { text: "Skips a generation" },
          ],
          points: 10,
        },
        {
          text: "Meiosis produces four genetically identical cells.",
          type: "true_false",
          options: [{ text: "True" }, { text: "False" }],
          points: 10,
        },
        {
          text: "Name the phase where chromosomes line up at the cell equator.",
          type: "short_answer",
          correctShortAnswer: "metaphase",
          points: 10,
        },
      ],
    });

    // The correct option ids only exist once Mongoose has assigned subdoc _ids.
    quiz.questions[0].correctOptionId = quiz.questions[0].options[0]._id;
    quiz.questions[1].correctOptionId = quiz.questions[1].options[1]._id;
    await quiz.save();
  }

  console.log("\n[seed] Done. Demo accounts:");
  console.log(`  teacher  ${TEACHER.email} / ${TEACHER.password}`);
  console.log(`  student  ${STUDENT.email} (or ID ${STUDENT.studentId}) / ${STUDENT.password}`);

  console.log("\n[seed] Lecture access codes (each unlocks one lecture, single use):");
  issued.forEach(({ title, codes }) => {
    console.log(`  ${title}`);
    console.log(`    ${codes.join("   ")}`);
  });
  console.log("\n  Redeem one on the student app under Recorded lectures.\n");

  await mongoose.connection.close();
}

seed().catch(async (err) => {
  console.error("[seed] Failed:", err.message);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
