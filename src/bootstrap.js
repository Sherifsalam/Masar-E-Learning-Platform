const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const { notFound, errorHandler } = require("./middleware/error.middleware");

const authRoutes = require("./modules/auth/auth.routes");
const studentRoutes = require("./modules/student/student.routes");
const teacherRoutes = require("./modules/teacher/teacher.routes");
const attendanceRoutes = require("./modules/attendance/attendance.routes");
const lectureRoutes = require("./modules/lecture/lecture.routes");
const fileRoutes = require("./modules/file/file.routes");
const quizRoutes = require("./modules/quiz/quiz.routes");
const reportRoutes = require("./modules/report/report.routes");

function bootstrap() {
  const app = express();

  // CLIENT_ORIGIN accepts a comma-separated list so the Vite dev server and a
  // deployed frontend can both be allowed. Unset means "allow any origin".
  const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || !allowedOrigins.length || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} is not allowed by CORS`));
      },
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

  // Serve the frontend prototype directly so it can call the API on the
  // same origin (avoids CORS headaches in local dev).
  app.use(express.static(path.join(__dirname, "..", "public")));

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
