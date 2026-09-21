import { useAuth } from "../../lib/AuthContext.jsx";

const LINKS = [
  { id: "t-attendance", label: "Attendance", icon: "▦" },
  { id: "t-students", label: "Students", icon: "👤" },
  { id: "t-quizzes", label: "Quizzes", icon: "📝" },
  { id: "t-reports", label: "Parent reports", icon: "✉️" },
];

export default function TeacherSidebar({ active, go }) {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="side-user">
        <div className="avatar" style={{ background: "var(--accent-tint)", color: "var(--accent)" }}>
          {(user && user.avatarInitials) || "??"}
        </div>
        <div>
          <div className="side-user-name">{(user && user.fullName) || "Teacher"}</div>
          <div className="side-user-sub">{(user && user.subject) || "—"}</div>
        </div>
      </div>
      {LINKS.map((l) => (
        <button
          key={l.id}
          className={"side-link" + (active === l.id ? " active" : "")}
          onClick={() => go(l.id)}
        >
          {l.icon}&nbsp; {l.label}
        </button>
      ))}
      <div className="side-foot">
        <button className="side-link" onClick={logout}>
          ↪&nbsp; Log out
        </button>
      </div>
    </aside>
  );
}
