import ProtoNav from "../shared/ProtoNav.jsx";
import TeacherLoginScreen from "./TeacherLoginScreen.jsx";
import AttendanceReviewScreen from "./AttendanceReviewScreen.jsx";
import StudentLookupScreen from "./StudentLookupScreen.jsx";
import QuizzesScreen from "./QuizzesScreen.jsx";
import ParentReportScreen from "./ParentReportScreen.jsx";

const SCREENS = [
  { id: "t-login", label: "Log in" },
  { id: "t-attendance", label: "Attendance review" },
  { id: "t-students", label: "Student lookup" },
  { id: "t-quizzes", label: "Quizzes" },
  { id: "t-reports", label: "Parent reports" },
];

export default function TeacherApp({ screen, setScreen, openQuiz }) {
  const go = (id) => setScreen(id);

  return (
    <div>
      <ProtoNav screens={SCREENS} active={screen} onPick={go} />
      {screen === "t-login" && <TeacherLoginScreen go={go} />}
      {screen === "t-attendance" && <AttendanceReviewScreen go={go} />}
      {screen === "t-students" && <StudentLookupScreen go={go} />}
      {screen === "t-quizzes" && <QuizzesScreen go={go} openQuiz={openQuiz} />}
      {screen === "t-reports" && <ParentReportScreen go={go} />}
    </div>
  );
}
