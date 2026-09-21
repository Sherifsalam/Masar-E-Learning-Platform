import { useState } from "react";
import ProtoNav from "../shared/ProtoNav.jsx";
import TeacherLoginScreen from "./TeacherLoginScreen.jsx";
import AttendanceReviewScreen from "./AttendanceReviewScreen.jsx";
import StudentLookupScreen from "./StudentLookupScreen.jsx";
import QuizzesScreen from "./QuizzesScreen.jsx";
import ParentReportScreen from "./ParentReportScreen.jsx";
import { useAuth } from "../../lib/AuthContext.jsx";

// Log in is not listed: it is the way in, not a screen to navigate back to.
const APP_SCREENS = [
  { id: "t-attendance", label: "Attendance review" },
  { id: "t-students", label: "Student lookup" },
  { id: "t-quizzes", label: "Quizzes" },
  { id: "t-reports", label: "Parent reports" },
];

export default function TeacherApp({ screen, setScreen, openQuiz }) {
  const { isTeacher } = useAuth();
  // Carries the selected student from lookup into the report builder.
  // Declared before any early return so the hook order never changes.
  const [focusStudentId, setFocusStudentId] = useState(null);

  const go = (id, studentId = null) => {
    if (studentId) setFocusStudentId(studentId);
    setScreen(id);
  };

  if (!isTeacher) return <TeacherLoginScreen go={go} />;

  const current = APP_SCREENS.some((s) => s.id === screen) ? screen : "t-attendance";

  return (
    <div>
      <ProtoNav screens={APP_SCREENS} active={current} onPick={(id) => go(id)} />
      {current === "t-attendance" && <AttendanceReviewScreen go={go} />}
      {current === "t-students" && <StudentLookupScreen go={go} initialStudentId={focusStudentId} />}
      {current === "t-quizzes" && <QuizzesScreen go={go} openQuiz={openQuiz} />}
      {current === "t-reports" && <ParentReportScreen go={go} studentId={focusStudentId} />}
    </div>
  );
}
