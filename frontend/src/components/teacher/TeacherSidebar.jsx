const LINKS = [
  { id: "t-attendance", label: "Attendance", icon: "▦" },
  { id: "t-students", label: "Students", icon: "👤" },
  { id: "t-quizzes", label: "Quizzes", icon: "📝" },
  { id: "t-reports", label: "Parent reports", icon: "✉️" },
];

export default function TeacherSidebar({ active, go }) {
  return (
    <aside className="sidebar">
      <div className="side-user">
        <div className="avatar" style={{ background: "var(--accent-tint)", color: "var(--accent)" }}>
          SH
        </div>
        <div>
          <div className="side-user-name">Ms. Sara Hassan</div>
          <div className="side-user-sub">Biology teacher</div>
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
        <button className="side-link">↪&nbsp; Log out</button>
      </div>
    </aside>
  );
}
