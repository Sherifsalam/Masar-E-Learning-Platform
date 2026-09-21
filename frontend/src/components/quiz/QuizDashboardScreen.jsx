import { useState } from "react";
import { useAuth } from "../../lib/AuthContext.jsx";
import { quizApi } from "../../lib/api.js";
import { useApi, Loading, ErrorMsg, Empty } from "../../lib/useApi.jsx";

const TAG_STYLE = {
  published: { background: "var(--success-tint)", color: "var(--success)" },
  scheduled: { background: "var(--late-tint)", color: "var(--late)" },
  draft: { background: "var(--canvas)", color: "var(--ink-soft)" },
};

export default function QuizDashboardScreen({ go }) {
  const { user, isTeacher } = useAuth();
  const { data: quizzes, error, loading, reload } = useApi(() => quizApi.list(), []);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  async function newQuiz() {
    setCreating(true);
    setCreateError(null);
    try {
      const quiz = await quizApi.create({
        title: "Untitled quiz",
        subject: user.subject || "General",
      });
      go("q-builder", quiz._id);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px" }}>
      <div className="main-head">
        <div>
          <div className="main-title">Quiz system</div>
          <div className="main-sub">
            Connected to Masar as {user.fullName}
            {user.subject ? ` · ${user.subject}` : ""}
          </div>
        </div>
        {isTeacher && (
          <button className="btn btn-accent" onClick={newQuiz} disabled={creating}>
            {creating ? "Creating…" : "+ New quiz"}
          </button>
        )}
      </div>

      {loading && <Loading />}
      <ErrorMsg error={error} onRetry={reload} />
      <ErrorMsg error={createError} />

      {quizzes && (isTeacher ? <TeacherStats quizzes={quizzes} /> : <StudentStats quizzes={quizzes} />)}

      {quizzes && !quizzes.length && <Empty label="No quizzes yet." />}

      <div className="quiz-grid">
        {(quizzes || []).map((q) =>
          isTeacher ? (
            <TeacherQuizCard key={q._id} quiz={q} go={go} onChanged={reload} />
          ) : (
            <StudentQuizCard key={q._id} quiz={q} go={go} />
          )
        )}
      </div>
    </div>
  );
}

function TeacherStats({ quizzes }) {
  const published = quizzes.filter((q) => q.status === "published").length;
  const scheduled = quizzes.filter((q) => q.status === "scheduled").length;
  const scored = quizzes.filter((q) => q.avgScore !== null);
  const avg = scored.length
    ? Math.round(scored.reduce((s, q) => s + q.avgScore, 0) / scored.length)
    : null;

  return (
    <div className="stat-row">
      <div className="stat-card accent-left">
        <div className="num">{quizzes.length}</div>
        <div className="lbl">Total quizzes</div>
      </div>
      <div className="stat-card accent-left ok">
        <div className="num">{published}</div>
        <div className="lbl">Published</div>
      </div>
      <div className="stat-card accent-left warn">
        <div className="num">{scheduled}</div>
        <div className="lbl">Scheduled</div>
      </div>
      <div className="stat-card accent-left">
        <div className="num">{avg === null ? "—" : `${avg}%`}</div>
        <div className="lbl">Avg score across quizzes</div>
      </div>
    </div>
  );
}

function StudentStats({ quizzes }) {
  const completed = quizzes.filter((q) => q.myAttemptStatus === "completed");
  const avg = completed.length
    ? Math.round(completed.reduce((s, q) => s + (q.myScorePercent || 0), 0) / completed.length)
    : null;

  return (
    <div className="stat-row">
      <div className="stat-card accent-left">
        <div className="num">{quizzes.length}</div>
        <div className="lbl">Quizzes available</div>
      </div>
      <div className="stat-card accent-left ok">
        <div className="num">{completed.length}</div>
        <div className="lbl">Completed</div>
      </div>
      <div className="stat-card accent-left warn">
        <div className="num">{quizzes.length - completed.length}</div>
        <div className="lbl">Still to take</div>
      </div>
      <div className="stat-card accent-left">
        <div className="num">{avg === null ? "—" : `${avg}%`}</div>
        <div className="lbl">Your average</div>
      </div>
    </div>
  );
}

function TeacherQuizCard({ quiz, go, onChanged }) {
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(`Delete "${quiz.title}" and all its attempts?`)) return;
    setBusy(true);
    try {
      await quizApi.remove(quiz._id);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  const completion = quiz.totalStudents
    ? Math.round((quiz.completedCount / quiz.totalStudents) * 100)
    : 0;

  return (
    <div className="quiz-card">
      <span className="qtag" style={TAG_STYLE[quiz.status] || TAG_STYLE.draft}>
        {quiz.status}
      </span>
      <h4>{quiz.title}</h4>
      <div className="qmeta">
        {quiz.questions.length} questions · {quiz.durationMinutes} min ·{" "}
        {quiz.completedCount}/{quiz.totalStudents} completed
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: completion + "%", background: "var(--success)" }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        {quiz.status !== "draft" && (
          <button className="btn btn-ghost btn-sm" onClick={() => go("q-results", quiz._id)}>
            Results
          </button>
        )}
        <button className="btn btn-primary btn-sm" onClick={() => go("q-builder", quiz._id)}>
          Edit
        </button>
        <button className="btn btn-ghost btn-sm" onClick={remove} disabled={busy}>
          Delete
        </button>
      </div>
    </div>
  );
}

function StudentQuizCard({ quiz, go }) {
  const done = quiz.myAttemptStatus === "completed";
  const open = quiz.status === "published";

  return (
    <div className="quiz-card">
      <span className="qtag" style={TAG_STYLE[quiz.status] || TAG_STYLE.draft}>
        {done ? "Completed" : quiz.status}
      </span>
      <h4>{quiz.title}</h4>
      <div className="qmeta">
        {quiz.questions.length} questions · {quiz.durationMinutes} min · {quiz.subject}
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: (done ? quiz.myScorePercent || 0 : 0) + "%", background: "var(--success)" }}
        />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
        {done ? (
          <span className="pill pill-ok">Your score: {quiz.myScorePercent}%</span>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            disabled={!open}
            onClick={() => go("q-take", quiz._id)}
          >
            {open ? "Start quiz" : "Not open yet"}
          </button>
        )}
      </div>
    </div>
  );
}
