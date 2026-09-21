import ProtoNav from "../shared/ProtoNav.jsx";
import SignUpScreen from "./SignUpScreen.jsx";
import LoginScreen from "./LoginScreen.jsx";
import HomeScreen from "./HomeScreen.jsx";
import AttendanceScanScreen from "./AttendanceScanScreen.jsx";
import LecturesScreen from "./LecturesScreen.jsx";
import FilesScreen from "./FilesScreen.jsx";
import { useAuth } from "../../lib/AuthContext.jsx";

// Only the screens a signed-in student navigates between. Log in and sign up
// are deliberately absent: they are how you get in, not places to visit.
const APP_SCREENS = [
  { id: "s-home", label: "Home" },
  { id: "s-scan", label: "Attendance / QR check-in" },
  { id: "s-lectures", label: "Recorded lectures" },
  { id: "s-files", label: "Saved files" },
];

export default function StudentApp({ screen, setScreen }) {
  const { isStudent } = useAuth();
  const go = (id) => setScreen(id);

  // Signed out, the auth pair is the only thing that renders — there is no
  // screen switcher to click, so no student screen can be reached at all.
  if (!isStudent) {
    return screen === "s-signup" ? <SignUpScreen go={go} /> : <LoginScreen go={go} />;
  }

  // Signed in, never sit on an auth screen.
  const current = APP_SCREENS.some((s) => s.id === screen) ? screen : "s-home";

  return (
    <div>
      <ProtoNav screens={APP_SCREENS} active={current} onPick={go} />
      {current === "s-home" && <HomeScreen go={go} />}
      {current === "s-scan" && <AttendanceScanScreen go={go} />}
      {current === "s-lectures" && <LecturesScreen go={go} />}
      {current === "s-files" && <FilesScreen go={go} />}
    </div>
  );
}
