const DISTRIBUTION = [
  { h: 14, l: "0–59" },
  { h: 22, l: "60–69" },
  { h: 48, l: "70–79" },
  { h: 100, l: "80–89" },
  { h: 70, l: "90–100" },
];

const STUDENT_SCORES = [
  { code: "NA", name: "Nour Ahmed", score: "92%", time: "11m 20s", status: "ok", statusLabel: "Completed" },
  { code: "KM", name: "Khaled Mostafa", score: "78%", time: "14m 05s", status: "ok", statusLabel: "Completed" },
  { code: "YS", name: "Yasmin Saeed", score: "—", time: "—", status: "bad", statusLabel: "Not started" },
  { code: "OT", name: "Omar Tarek", score: "96%", time: "9m 48s", status: "ok", statusLabel: "Completed" },
];

export default function QuizResultsScreen() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px" }}>
      <div className="main-head">
        <div>
          <div className="main-title">Results — Cell division chapter check</div>
          <div className="main-sub">26 of 28 students completed · average score 85%</div>
        </div>
        <button className="btn btn-ghost">Export CSV</button>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-title">Score distribution</div>
          <div className="dist-bars">
            {DISTRIBUTION.map((b, i) => (
              <div className="col" key={i}>
                <div className="fill" style={{ height: b.h + "%" }} />
                <div className="lbl">{b.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Weakest questions</div>
          <table>
            <tbody>
              <tr>
                <td>Q7 — Meiosis stage order</td>
                <td style={{ textAlign: "right" }}>
                  <span className="pill pill-bad">52% correct</span>
                </td>
              </tr>
              <tr>
                <td>Q3 — Chromosome pairing</td>
                <td style={{ textAlign: "right" }}>
                  <span className="pill pill-warn">68% correct</span>
                </td>
              </tr>
              <tr>
                <td>Q9 — Cytokinesis definition</td>
                <td style={{ textAlign: "right" }}>
                  <span className="pill pill-warn">71% correct</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">Student scores</div>
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
            {STUDENT_SCORES.map((s, i) => (
              <tr key={i}>
                <td>
                  <div className="name-cell">
                    <div className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>
                      {s.code}
                    </div>
                    {s.name}
                  </div>
                </td>
                <td>{s.score}</td>
                <td>{s.time}</td>
                <td>
                  <span className={"pill pill-" + s.status}>{s.statusLabel}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
