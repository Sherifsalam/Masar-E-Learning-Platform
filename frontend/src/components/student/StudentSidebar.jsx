import { useAuth } from "../../lib/AuthContext.jsx";

const LINKS = [
  { id: "s-home", label: "Home", icon: "🏠" },
  { id: "s-scan", label: "Attendance", icon: "▦" },
  { id: "s-lectures", label: "Recorded lectures", icon: "▶" },
  { id: "s-files", label: "Saved files", icon: "📄" },
];

export default function StudentSidebar({ active, go }) {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="side-user">
        <div className="avatar">{(user && user.avatarInitials) || "??"}</div>
        <div>
          <div className="side-user-name">{(user && user.fullName) || "Student"}</div>
          <div className="side-user-sub">
            {user ? `${user.grade} — ${user.section}` : "Not signed in"}
          </div>
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
