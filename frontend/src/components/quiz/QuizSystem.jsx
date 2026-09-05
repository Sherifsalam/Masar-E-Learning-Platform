import ProtoNav from "../shared/ProtoNav.jsx";
import QuizDashboardScreen from "./QuizDashboardScreen.jsx";
import QuizBuilderScreen from "./QuizBuilderScreen.jsx";
import QuizTakeScreen from "./QuizTakeScreen.jsx";
import QuizResultsScreen from "./QuizResultsScreen.jsx";

const SCREENS = [
  { id: "q-dashboard", label: "Teacher: quiz dashboard" },
  { id: "q-builder", label: "Teacher: quiz builder" },
  { id: "q-take", label: "Student: taking a quiz" },
  { id: "q-results", label: "Results & analytics" },
];

export default function QuizSystem({ screen, setScreen }) {
  const go = (id) => setScreen(id);

  return (
    <div>
      <ProtoNav screens={SCREENS} active={screen} onPick={go} />
      {screen === "q-dashboard" && <QuizDashboardScreen go={go} />}
      {screen === "q-builder" && <QuizBuilderScreen />}
      {screen === "q-take" && <QuizTakeScreen />}
      {screen === "q-results" && <QuizResultsScreen />}
    </div>
  );
}
