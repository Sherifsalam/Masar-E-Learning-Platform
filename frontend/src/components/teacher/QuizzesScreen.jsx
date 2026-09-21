import TeacherSidebar from "./TeacherSidebar.jsx";
import { quizApi } from "../../lib/api.js";
import { useApi, Loading, ErrorMsg, Empty } from "../../lib/useApi.jsx";

const STATUS_PILL = { published: "ok", draft: "neutral", scheduled: "warn" };

export default function QuizzesScreen({ go, openQuiz }) {
  const { data: quizzes, error, loading, reload } = useApi(() => quizApi.list(), []);

  return (
    <div className="app-shell">
      <TeacherSidebar active="t-quizzes" go={go} />
      <main className="main">
        <div className="main-head">
          <div>
            <div className="main-title">Quizzes</div>
            <div className="main-sub">Quizzes are created and graded in the Masar Quiz System</div>
          </div>
        </div>

        <div className="quiz-link-card">
          <div className="quiz-link-text">
            <h3>Build and grade quizzes in Quiz System</h3>
            <p>Create questions, set time limits, and see live results — scores sync back here automatically once students finish.</p>
          </div>
          <button className="btn btn-primary" onClick={() => openQuiz("q-dashboard")}>
            Open quiz system →
          </button>
        </div>

        <div className="card">
          <div className="card-title">
            Your quizzes <span className="pill pill-neutral">{quizzes ? quizzes.length : 0} total</span>
          </div>

          {loading && <Loading />}
          <ErrorMsg error={error} onRetry={reload} />
          {quizzes && !quizzes.length && <Empty label="No quizzes yet — create one in the quiz system." />}

          {!!(quizzes && quizzes.length) && (
            <table>
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Status</th>
                  <th>Attempts</th>
                  <th>Average score</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((q) => (
                  <tr key={q._id}>
                    <td>{q.title}</td>
                    <td>
                      <span className={"pill pill-" + (STATUS_PILL[q.status] || "neutral")}>{q.status}</span>
                    </td>
                    <td>
                      {q.completedCount}/{q.totalStudents}
                    </td>
                    <td>{q.avgScore === null ? "—" : `${q.avgScore}%`}</td>
                    <td>
                      {q.status === "draft" ? (
                        <button className="btn btn-ghost btn-sm" onClick={() => openQuiz("q-builder", q._id)}>
                          Edit
                        </button>
                      ) : (
                        <button className="btn btn-ghost btn-sm" onClick={() => openQuiz("q-results", q._id)}>
                          View results
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
