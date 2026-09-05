const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { notFound, errorHandler } = require("./middleware/error.middleware");

const authRoutes = require("./modules/auth/auth.routes");
const studentRoutes = require("./modules/student/student.routes");
const teacherRoutes = require("./modules/teacher/teacher.routes");
const attendanceRoutes = require("./modules/attendance/attendance.routes");
const lectureRoutes = require("./modules/lecture/lecture.routes");
const fileRoutes = require("./modules/file/file.routes");
const quizRoutes = require("./modules/quiz/quiz.routes");
const reportRoutes = require("./modules/report/report.routes");

// Builds and returns the configured Express app. Kept separate from
// index.js so the app can be imported directly in tests without
// binding to a port or connecting to the database.
function bootstrap() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*", credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

  app.get("/api/health", (req, res) => res.json({ success: true, message: "Masar API is running" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/students", studentRoutes);
  app.use("/api/teachers", teacherRoutes);
  app.use("/api/attendance", attendanceRoutes);
  app.use("/api/lectures", lectureRoutes);
  app.use("/api/files", fileRoutes);
  app.use("/api/quizzes", quizRoutes);
  app.use("/api/reports", reportRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = bootstrap;
