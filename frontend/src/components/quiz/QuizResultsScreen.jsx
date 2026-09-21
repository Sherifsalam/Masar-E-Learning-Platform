import { quizApi } from "../../lib/api.js";
import { useApi, Loading, ErrorMsg, Empty } from "../../lib/useApi.jsx";

function pillFor(rate) {
  if (rate === null) return "neutral";
  if (rate >= 80) return "ok";
  if (rate >= 60) return "warn";
  return "bad";
}

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return "—";
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
}

function toCsv(rows) {
  const header = ["Student", "Student ID", "Score %", "Status", "Time taken (s)"];
  const body = rows.map((r) => [
    r.student ? r.student.fullName : "",
    r.student ? r.student.studentId : "",
    r.scorePercent === null ? "" : r.scorePercent,
    r.status,
    r.timeTakenSeconds === null ? "" : r.timeTakenSeconds,
  ]);
  return [header, ...body]
    .map((cols) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export default function QuizResultsScreen({ quizId, go }) {
  const { data, error, loading, reload } = useApi(
    () => (quizId ? quizApi.results(quizId) : Promise.reject(new Error("No quiz selected."))),
    [quizId]
  );

  function exportCsv() {
    const blob = new Blob([toCsv(data.studentScores)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz-results.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (loading) return <Loading label="Loading results…" />;
  if (error) return <ErrorMsg error={error} onRetry={reload} />;

  const peak = Math.max(1, ...data.distribution.map((b) => b.count));

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px" }}>
      <div className="main-head">
        <div>
          <div className="main-title">Results</div>
          <div className="main-sub">
            {data.completedCount} of {data.totalAttempts || 0} attempts completed
            {data.averageScore === null ? "" : ` · average score ${data.averageScore}%`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => go("q-dashboard")}>
            Back
          </button>
          <button className="btn btn-ghost" onClick={exportCsv} disabled={!data.studentScores.length}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Score distribution</div>
          {!data.completedCount ? (
            <Empty label="No completed attempts yet." />
          ) : (
            <div className="dist-bars">
              {data.distribution.map((b) => (
                <div className="col" key={b.label} title={`${b.count} student(s)`}>
                  <div className="fill" style={{ height: (b.count / peak) * 100 + "%" }} />
                  <div className="lbl">{b.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Weakest questions</div>
          {!data.weakestQuestions.length ? (
            <Empty label="Not enough answers to rank questions yet." />
          ) : (
            <table>
              <tbody>
                {data.weakestQuestions.map((q) => (
                  <tr key={q.questionId}>
                    <td>{q.text}</td>
                    <td style={{ textAlign: "right" }}>
                      <span className={"pill pill-" + pillFor(q.correctRate)}>{q.correctRate}% correct</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">Student scores</div>
        {!data.studentScores.length ? (
          <Empty label="No students have opened this quiz yet." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Score</th>
                <th>Time taken</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.studentScores.map((s, i) => (
                <tr key={i}>
                  <td>
                    <div className="name-cell">
                      <div className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>
                        {(s.student && s.student.avatarInitials) || "??"}
                      </div>
                      {s.student ? s.student.fullName : "Unknown"}
                    </div>
                  </td>
                  <td>{s.scorePercent === null ? "—" : `${s.scorePercent}%`}</td>
                  <td>{formatDuration(s.timeTakenSeconds)}</td>
                  <td>
                    <span className={"pill pill-" + (s.status === "completed" ? "ok" : "warn")}>
                      {s.status === "completed" ? "Completed" : "In progress"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
