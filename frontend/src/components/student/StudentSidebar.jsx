const LINKS = [
  { id: "s-home", label: "Home", icon: "🏠" },
  { id: "s-scan", label: "Attendance", icon: "▦" },
  { id: "s-lectures", label: "Recorded lectures", icon: "▶" },
  { id: "s-files", label: "Saved files", icon: "📄" },
];

export default function StudentSidebar({ active, go }) {
  return (
    <aside className="sidebar">
      <div className="side-user">
        <div className="avatar">NA</div>
        <div>
          <div className="side-user-name">Nour Ahmed</div>
          <div className="side-user-sub">Grade 10 — Section B</div>
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
      <button className="side-link">👤&nbsp; My grades</button>
      <div className="side-foot">
        <button className="side-link">⚙️&nbsp; Settings</button>
        <button className="side-link">↪&nbsp; Log out</button>
      </div>
    </aside>
  );
}
