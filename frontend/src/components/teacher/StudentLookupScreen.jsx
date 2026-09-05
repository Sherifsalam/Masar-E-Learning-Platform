import TeacherSidebar from "./TeacherSidebar.jsx";

const ATTENDANCE_WEEKS = [90, 100, 100, 60, 95, 100, 90, 96];

export default function StudentLookupScreen({ go }) {
  return (
    <div className="app-shell">
      <TeacherSidebar active="t-students" go={go} />
      <main className="main">
        <div className="main-head">
          <div>
            <div className="main-title">Students</div>
            <div className="main-sub">Search any student to see their full record</div>
          </div>
        </div>
        <div className="grid-2" style={{ gridTemplateColumns: "0.8fr 1.2fr" }}>
          <div className="card">
            <input
              placeholder="Search by name or student ID"
              style={{
                width: "100%",
                padding: "10px 13px",
                borderRadius: 9,
                border: "1px solid var(--border-strong)",
                fontSize: 13.5,
                marginBottom: 14,
              }}
            />
            <div
              className="file-row"
              style={{ cursor: "pointer", background: "var(--primary-tint)", borderRadius: 9, padding: "10px 8px" }}
            >
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                NA
              </div>
              <div>
                <div className="file-name">Nour Ahmed</div>
                <div className="file-meta">ID 22-10453 · Grade 10-B</div>
              </div>
            </div>
            <div className="file-row">
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                KM
              </div>
              <div>
                <div className="file-name">Khaled Mostafa</div>
                <div className="file-meta">ID 22-10412 · Grade 10-B</div>
              </div>
            </div>
            <div className="file-row">
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                YS
              </div>
              <div>
                <div className="file-name">Yasmin Saeed</div>
                <div className="file-meta">ID 22-10488 · Grade 10-B</div>
              </div>
            </div>
            <div className="file-row">
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                OT
              </div>
              <div>
                <div className="file-name">Omar Tarek</div>
                <div className="file-meta">ID 22-10401 · Grade 10-B</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="detail-head">
              <div className="detail-avatar">NA</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18 }}>Nour Ahmed</h3>
                <p style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>Student ID 22-10453 · Grade 10, Section B</p>
              </div>
              <button className="btn btn-accent btn-sm" onClick={() => go("t-reports")}>
                Generate parent report
              </button>
            </div>
            <div className="kv-grid" style={{ marginBottom: 16 }}>
              <div>
                <div className="k">Parent / guardian</div>
                <div className="v">Mrs. Amal Ahmed</div>
              </div>
              <div>
                <div className="k">Contact</div>
                <div className="v">+20 100 123 4567</div>
              </div>
              <div>
                <div className="k">Overall attendance</div>
                <div className="v">96%</div>
              </div>
              <div>
                <div className="k">Overall average grade</div>
                <div className="v">A- (91%)</div>
              </div>
            </div>
            <h4 style={{ fontSize: 12, textTransform: "uppercase", color: "var(--ink-faint)", letterSpacing: ".04em", marginBottom: 6 }}>
              Attendance — last 8 weeks
            </h4>
            <div className="bars">
              {ATTENDANCE_WEEKS.map((h, i) => (
                <div className={"bar" + (h < 70 ? " low" : "")} style={{ height: h + "%" }} key={i}>
                  <span style={{ height: h + "%" }} />
                </div>
              ))}
            </div>
            <h4
              style={{ fontSize: 12, textTransform: "uppercase", color: "var(--ink-faint)", letterSpacing: ".04em", margin: "18px 0 6px" }}
            >
              Recent quiz scores
            </h4>
            <table>
              <tbody>
                <tr>
                  <td>Cell division quiz</td>
                  <td style={{ textAlign: "right" }}>
                    <span className="pill pill-ok">92%</span>
                  </td>
                </tr>
                <tr>
                  <td>Photosynthesis pop quiz</td>
                  <td style={{ textAlign: "right" }}>
                    <span className="pill pill-ok">88%</span>
                  </td>
                </tr>
                <tr>
                  <td>Chapter 5 review</td>
                  <td style={{ textAlign: "right" }}>
                    <span className="pill pill-warn">74%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
