import ProtoNav from "../shared/ProtoNav.jsx";
import SignUpScreen from "./SignUpScreen.jsx";
import LoginScreen from "./LoginScreen.jsx";
import HomeScreen from "./HomeScreen.jsx";
import AttendanceScanScreen from "./AttendanceScanScreen.jsx";
import LecturesScreen from "./LecturesScreen.jsx";
import FilesScreen from "./FilesScreen.jsx";

const SCREENS = [
  { id: "s-signup", label: "Sign up" },
  { id: "s-login", label: "Log in" },
  { id: "s-home", label: "Home" },
  { id: "s-scan", label: "Attendance / QR check-in" },
  { id: "s-lectures", label: "Recorded lectures" },
  { id: "s-files", label: "Saved files" },
];

export default function StudentApp({ screen, setScreen }) {
  const go = (id) => setScreen(id);

  return (
    <div>
      <ProtoNav screens={SCREENS} active={screen} onPick={go} />
      {screen === "s-signup" && <SignUpScreen go={go} />}
      {screen === "s-login" && <LoginScreen go={go} />}
      {screen === "s-home" && <HomeScreen go={go} />}
      {screen === "s-scan" && <AttendanceScanScreen go={go} />}
      {screen === "s-lectures" && <LecturesScreen go={go} />}
      {screen === "s-files" && <FilesScreen go={go} />}
    </div>
  );
}
