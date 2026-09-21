import { useEffect, useState } from "react";
import TopBar from "./components/shared/TopBar.jsx";
import StudentApp from "./components/student/StudentApp.jsx";
import TeacherApp from "./components/teacher/TeacherApp.jsx";
import QuizSystem from "./components/quiz/QuizSystem.jsx";
import { useAuth } from "./lib/AuthContext.jsx";
import { Loading } from "./lib/useApi.jsx";

export default function App() {
  const { user, loading, isStudent, isTeacher } = useAuth();

  const [role, setRole] = useState("student");
  const [studentScreen, setStudentScreen] = useState("s-login");
  const [teacherScreen, setTeacherScreen] = useState("t-login");
  const [quizScreen, setQuizScreen] = useState("q-dashboard");
  const [activeQuizId, setActiveQuizId] = useState(null);

  // Follow the signed-in account: land on its first real screen, and fall back
  // to the matching login form when the session ends.
  useEffect(() => {
    if (loading) return;
    if (isStudent) {
      setRole("student");
      setStudentScreen((s) => (s === "s-login" || s === "s-signup" ? "s-home" : s));
    } else if (isTeacher) {
      setRole("teacher");
      setTeacherScreen((s) => (s === "t-login" ? "t-attendance" : s));
    } else {
      setStudentScreen((s) => (s === "s-signup" ? "s-signup" : "s-login"));
      setTeacherScreen("t-login");
      setQuizScreen("q-dashboard");
    }
  }, [loading, isStudent, isTeacher]);

  // Lets the teacher portal jump straight into a specific quiz-system screen.
  const openQuiz = (screenId, quizId = null) => {
    setActiveQuizId(quizId);
    setRole("quiz");
    setQuizScreen(screenId);
  };

  if (loading) {
    return (
      <div className="masar">
        <TopBar role={role} setRole={setRole} />
        <Loading label="Restoring your session…" />
      </div>
    );
  }

  return (
    <div className="masar">
      <TopBar role={role} setRole={setRole} />

      {role === "student" && <StudentApp screen={studentScreen} setScreen={setStudentScreen} />}
      {role === "teacher" && <TeacherApp screen={teacherScreen} setScreen={setTeacherScreen} openQuiz={openQuiz} />}
      {role === "quiz" && (
        <QuizSystem
          screen={quizScreen}
          setScreen={setQuizScreen}
          quizId={activeQuizId}
          setQuizId={setActiveQuizId}
        />
      )}

      <div className="footer-note">
        Masar — student app, teacher app &amp; quiz system · connected to the Masar API
      </div>
    </div>
  );
}
