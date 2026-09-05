export default function ProtoNav({ screens, active, onPick }) {
  return (
    <div className="proto-nav">
      <span className="proto-label">Screen</span>
      {screens.map((s) => (
        <button
          key={s.id}
          className={"proto-btn" + (active === s.id ? " active" : "")}
          onClick={() => onPick(s.id)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
