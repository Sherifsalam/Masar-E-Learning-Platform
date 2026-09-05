import { QUIZZES } from "./quizzes.data.js";

export default function QuizDashboardScreen({ go }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px" }}>
      <div className="main-head">
        <div>
          <div className="main-title">Quiz system</div>
          <div className="main-sub">Connected to Masar as Ms. Sara Hassan · Biology 101</div>
        </div>
        <button className="btn btn-accent" onClick={() => go("q-builder")}>
          + New quiz
        </button>
      </div>
      <div className="stat-row">
        <div className="stat-card accent-left">
          <div className="num">4</div>
          <div className="lbl">Total quizzes</div>
        </div>
        <div className="stat-card accent-left ok">
          <div className="num">2</div>
          <div className="lbl">Published</div>
        </div>
        <div className="stat-card accent-left warn">
          <div className="num">1</div>
          <div className="lbl">Scheduled</div>
        </div>
        <div className="stat-card accent-left">
          <div className="num">83%</div>
          <div className="lbl">Avg score across quizzes</div>
        </div>
      </div>
      <div className="quiz-grid">
        {QUIZZES.map((q, i) => (
          <div className="quiz-card" key={i}>
            <span className="qtag" style={{ background: q.tagBg, color: q.tagColor }}>
              {q.tag}
            </span>
            <h4>{q.title}</h4>
            <div className="qmeta">{q.meta}</div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: q.pct + "%", background: "var(--success)" }} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {q.primaryLabel ? (
                <button className="btn btn-primary btn-sm" onClick={() => go("q-builder")}>
                  {q.primaryLabel}
                </button>
              ) : (
                <>
                  <button className="btn btn-ghost btn-sm" onClick={() => go("q-results")}>
                    Results
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => go("q-builder")}>
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
