import { useState } from "react";
import TeacherSidebar from "./TeacherSidebar.jsx";

const SEND_METHODS = [
  { id: "Email", icon: "📧" },
  { id: "SMS", icon: "💬" },
  { id: "WhatsApp", icon: "📱" },
];

export default function ParentReportScreen({ go }) {
  const [sendMethod, setSendMethod] = useState("Email");

  return (
    <div className="app-shell">
      <TeacherSidebar active="t-reports" go={go} />
      <main className="main">
        <div className="main-head">
          <div>
            <div className="main-title">Send a parent report</div>
            <div className="main-sub">Build a summary and send it straight to a parent or guardian</div>
          </div>
        </div>
        <div className="report-layout">
          <div className="card">
            <div className="card-title">Report details</div>
            <div className="field">
              <label>Student</label>
              <select>
                <option>Nour Ahmed — Grade 10, Section B</option>
              </select>
            </div>
            <div className="field">
              <label>Period</label>
              <select>
                <option>This month — August 2026</option>
                <option>This term</option>
                <option>Custom range</option>
              </select>
            </div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)", display: "block", marginBottom: 6 }}>
              Include in report
            </label>
            <div className="check-row">
              <input type="checkbox" defaultChecked /> Attendance summary
            </div>
            <div className="check-row">
              <input type="checkbox" defaultChecked /> Grades &amp; quiz scores
            </div>
            <div className="check-row">
              <input type="checkbox" defaultChecked /> Lecture engagement
            </div>
            <div className="check-row">
              <input type="checkbox" /> Behavior notes
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label>Teacher note (optional)</label>
              <textarea defaultValue="Nour has been doing great this month — very engaged in class discussions. A little extra practice on genetics would help ahead of the next test." />
            </div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)", display: "block", margin: "14px 0 6px" }}>
              Send via
            </label>
            <div className="send-methods">
              {SEND_METHODS.map((m) => (
                <div
                  key={m.id}
                  className={"send-method" + (sendMethod === m.id ? " sel" : "")}
                  onClick={() => setSendMethod(m.id)}
                >
                  {m.icon} {m.id}
                </div>
              ))}
            </div>
          </div>
          <div className="report-preview">
            <h3>Monthly progress report</h3>
            <div className="sub">Nour Ahmed · Grade 10, Section B · August 2026</div>
            <div className="report-block">
              <h4>Attendance</h4>
              <p style={{ fontSize: 13.5 }}>Present 24/25 days (96%) · 1 late arrival, 0 absences this month.</p>
            </div>
            <div className="report-block">
              <h4>Grades &amp; quizzes</h4>
              <p style={{ fontSize: 13.5 }}>Overall average 91% (A-). Latest quiz: Cell division — 92%.</p>
            </div>
            <div className="report-block">
              <h4>Lecture engagement</h4>
              <p style={{ fontSize: 13.5 }}>Watched 18 of 20 assigned recordings this month.</p>
            </div>
            <div className="report-block">
              <h4>Note from Ms. Hassan</h4>
              <p style={{ fontSize: 13.5 }}>
                Nour has been doing great this month — very engaged in class discussions. A little extra practice on genetics would help
                ahead of the next test.
              </p>
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 6 }}>
              Send report to parent
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
