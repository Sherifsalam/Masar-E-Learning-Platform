import { useState } from "react";
import TopBar from "./components/shared/TopBar.jsx";
import StudentApp from "./components/student/StudentApp.jsx";
import TeacherApp from "./components/teacher/TeacherApp.jsx";
import QuizSystem from "./components/quiz/QuizSystem.jsx";

export default function App() {
  const [role, setRole] = useState("student");
  const [studentScreen, setStudentScreen] = useState("s-signup");
  const [teacherScreen, setTeacherScreen] = useState("t-login");
  const [quizScreen, setQuizScreen] = useState("q-dashboard");

  // Lets the teacher portal jump straight into a specific quiz-system screen.
  const openQuiz = (screenId) => {
    setRole("quiz");
    setQuizScreen(screenId);
  };

  return (
    <div className="masar">
      <TopBar role={role} setRole={setRole} />

      {role === "student" && <StudentApp screen={studentScreen} setScreen={setStudentScreen} />}
      {role === "teacher" && <TeacherApp screen={teacherScreen} setScreen={setTeacherScreen} openQuiz={openQuiz} />}
      {role === "quiz" && <QuizSystem screen={quizScreen} setScreen={setQuizScreen} />}

      <div className="footer-note">Masar — clickable UI/UX prototype · student app, teacher app &amp; quiz system</div>
    </div>
  );
}
