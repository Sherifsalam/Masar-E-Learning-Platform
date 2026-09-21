import ProtoNav from "../shared/ProtoNav.jsx";
import QuizDashboardScreen from "./QuizDashboardScreen.jsx";
import QuizBuilderScreen from "./QuizBuilderScreen.jsx";
import QuizTakeScreen from "./QuizTakeScreen.jsx";
import QuizResultsScreen from "./QuizResultsScreen.jsx";
import { useAuth } from "../../lib/AuthContext.jsx";

const SCREENS = [
  { id: "q-dashboard", label: "Quiz dashboard" },
  { id: "q-builder", label: "Teacher: quiz builder" },
  { id: "q-take", label: "Student: taking a quiz" },
  { id: "q-results", label: "Results & analytics" },
];

// The quiz system is shared, but each screen belongs to one role.
const TEACHER_ONLY = ["q-builder", "q-results"];
const STUDENT_ONLY = ["q-take"];

export default function QuizSystem({ screen, setScreen, quizId, setQuizId }) {
  const { user, isTeacher, isStudent } = useAuth();

  const go = (id, id2 = null) => {
    if (id2 !== null) setQuizId(id2);
    setScreen(id);
  };

  if (!user) {
    return (
      <div>
        <ProtoNav screens={SCREENS} active={screen} onPick={(id) => go(id)} />
        <div className="state-msg">Log in as a teacher or student to use the quiz system.</div>
      </div>
    );
  }

  const blocked =
    (TEACHER_ONLY.includes(screen) && !isTeacher) || (STUDENT_ONLY.includes(screen) && !isStudent);
  const current = blocked ? "q-dashboard" : screen;

  return (
    <div>
      <ProtoNav
        screens={SCREENS.filter(
          (s) =>
            !(TEACHER_ONLY.includes(s.id) && !isTeacher) && !(STUDENT_ONLY.includes(s.id) && !isStudent)
        )}
        active={current}
        onPick={(id) => go(id)}
      />
      {current === "q-dashboard" && <QuizDashboardScreen go={go} />}
      {current === "q-builder" && <QuizBuilderScreen quizId={quizId} go={go} />}
      {current === "q-take" && <QuizTakeScreen quizId={quizId} go={go} />}
      {current === "q-results" && <QuizResultsScreen quizId={quizId} go={go} />}
    </div>
  );
}
