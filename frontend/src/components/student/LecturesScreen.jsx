import StudentSidebar from "./StudentSidebar.jsx";
import { LECTURES } from "./lectures.data.js";

export default function LecturesScreen({ go }) {
  return (
    <div className="app-shell">
      <StudentSidebar active="s-lectures" go={go} />
      <main className="main">
        <div className="main-head">
          <div>
            <div className="main-title">Recorded lectures</div>
            <div className="main-sub">Catch up on any class, anytime</div>
          </div>
        </div>
        <div className="file-filters">
          <button className="chip active">All subjects</button>
          <button className="chip">Biology</button>
          <button className="chip">Physics</button>
          <button className="chip">Math</button>
        </div>
        <div className="lecture-grid">
          {LECTURES.map((l, i) => (
            <div className="lecture-card" key={i}>
              <div className="lecture-thumb" style={{ background: l.grad }}>
                <div className="playdot">▶</div>
              </div>
              <div className="lecture-body">
                <div className="lecture-subject">{l.subject}</div>
                <div className="lecture-name">{l.name}</div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: l.pct + "%" }} />
                </div>
                <div className="lecture-meta">
                  <span>{l.dur}</span>
                  <span>{l.meta}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
