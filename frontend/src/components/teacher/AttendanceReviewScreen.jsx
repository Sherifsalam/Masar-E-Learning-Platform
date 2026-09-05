import TeacherSidebar from "./TeacherSidebar.jsx";
import { ROSTER } from "./roster.data.js";

export default function AttendanceReviewScreen({ go }) {
  return (
    <div className="app-shell">
      <TeacherSidebar active="t-attendance" go={go} />
      <main className="main">
        <div className="main-head">
          <div>
            <div className="main-title">Attendance — Biology 101</div>
            <div className="main-sub">Grade 10, Section B · Wednesday, Sept 3</div>
          </div>
          <select style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border-strong)", fontSize: 13 }}>
            <option>Today — Sept 3</option>
            <option>Sept 2</option>
            <option>Sept 1</option>
          </select>
        </div>
        <div className="stat-row">
          <div className="stat-card accent-left">
            <div className="num">28</div>
            <div className="lbl">Total students</div>
          </div>
          <div className="stat-card accent-left ok">
            <div className="num">24</div>
            <div className="lbl">Present today</div>
          </div>
          <div className="stat-card accent-left bad">
            <div className="num">2</div>
            <div className="lbl">Absent today</div>
          </div>
          <div className="stat-card accent-left warn">
            <div className="num">2</div>
            <div className="lbl">Late today</div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">
            Class roster <span className="pill pill-neutral">28 students</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Check-in time</th>
                <th>Status</th>
                <th>Term attendance</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ROSTER.map((r, i) => (
                <tr key={i}>
                  <td>
                    <div className="name-cell">
                      <div className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>
                        {r.code}
                      </div>
                      {r.name}
                    </div>
                  </td>
                  <td>{r.time}</td>
                  <td>
                    <span className={"pill pill-" + r.status}>{r.statusLabel}</span>
                  </td>
                  <td>
                    <div className="mini-bar">
                      <span style={{ width: r.term + "%" }} />
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => go("t-students")}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
