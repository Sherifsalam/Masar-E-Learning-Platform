import TeacherSidebar from "./TeacherSidebar.jsx";

export default function QuizzesScreen({ go, openQuiz }) {
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
            Your quizzes <span className="pill pill-neutral">4 total</span>
          </div>
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
              <tr>
                <td>Cell division — chapter check</td>
                <td>
                  <span className="pill pill-ok">Published</span>
                </td>
                <td>26/28</td>
                <td>85%</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => openQuiz("q-results")}>
                    View results
                  </button>
                </td>
              </tr>
              <tr>
                <td>Photosynthesis pop quiz</td>
                <td>
                  <span className="pill pill-ok">Published</span>
                </td>
                <td>28/28</td>
                <td>81%</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => openQuiz("q-results")}>
                    View results
                  </button>
                </td>
              </tr>
              <tr>
                <td>Genetics — mid-unit test</td>
                <td>
                  <span className="pill pill-neutral">Draft</span>
                </td>
                <td>—</td>
                <td>—</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => openQuiz("q-builder")}>
                    Edit
                  </button>
                </td>
              </tr>
              <tr>
                <td>Ecosystems — final review</td>
                <td>
                  <span className="pill pill-warn">Scheduled</span>
                </td>
                <td>—</td>
                <td>—</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => openQuiz("q-builder")}>
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
