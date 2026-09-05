const ROLES = [
  { id: "student", label: "Student app" },
  { id: "teacher", label: "Teacher app" },
  { id: "quiz", label: "Quiz system" },
];

export default function TopBar({ role, setRole }) {
  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-mark">M</div>
        <div>
          <div className="brand-name">Masar</div>
          <div className="brand-tag">E-learning system</div>
        </div>
      </div>
      <div className="role-tabs">
        {ROLES.map((r) => (
          <button
            key={r.id}
            className={"role-tab" + (role === r.id ? " active" : "")}
            onClick={() => setRole(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div style={{ width: 120 }} />
    </div>
  );
}
