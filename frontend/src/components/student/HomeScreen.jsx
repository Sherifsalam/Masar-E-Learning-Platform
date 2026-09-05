import StudentSidebar from "./StudentSidebar.jsx";
import { QrIcon } from "../shared/Icons.jsx";

export default function HomeScreen({ go }) {
  return (
    <div className="app-shell">
      <StudentSidebar active="s-home" go={go} />
      <main className="main">
        <div className="main-head">
          <div>
            <div className="main-title">Good morning, Nour 👋</div>
            <div className="main-sub">Wednesday, Sept 3 — you have 2 classes today</div>
          </div>
        </div>

        <div className="qr-hero">
          <div className="qr-hero-text">
            <h2>Biology 101 starts in 12 minutes</h2>
            <p>Scan the QR code shown on the classroom screen to mark yourself present. It only takes a few seconds.</p>
          </div>
          <button className="qr-scan-btn" onClick={() => go("s-scan")}>
            <QrIcon />
            Scan QR to check in
          </button>
        </div>

        <div className="stat-row">
          <div className="stat-card accent-left ok">
            <div className="num">96%</div>
            <div className="lbl">Attendance rate</div>
          </div>
          <div className="stat-card accent-left">
            <div className="num">18</div>
            <div className="lbl">Lectures watched</div>
          </div>
          <div className="stat-card accent-left">
            <div className="num">7</div>
            <div className="lbl">Saved files</div>
          </div>
          <div className="stat-card accent-left warn">
            <div className="num">2</div>
            <div className="lbl">Quizzes due this week</div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-title">
              Continue watching <span className="pill pill-info">3 in progress</span>
            </div>
            <div className="file-row">
              <div className="file-icon" style={{ background: "var(--primary)" }}>
                ▶
              </div>
              <div style={{ flex: 1 }}>
                <div className="file-name">Cell division — mitosis vs meiosis</div>
                <div className="progress-track" style={{ marginTop: 6, width: 200 }}>
                  <div className="progress-fill" style={{ width: "64%" }} />
                </div>
              </div>
              <span className="pill pill-neutral">64%</span>
            </div>
            <div className="file-row">
              <div className="file-icon" style={{ background: "var(--primary)" }}>
                ▶
              </div>
              <div style={{ flex: 1 }}>
                <div className="file-name">Newton's laws — worked examples</div>
                <div className="progress-track" style={{ marginTop: 6, width: 200 }}>
                  <div className="progress-fill" style={{ width: "30%" }} />
                </div>
              </div>
              <span className="pill pill-neutral">30%</span>
            </div>
          </div>
          <div className="card">
            <div className="card-title">This week's attendance</div>
            <table>
              <tbody>
                <tr>
                  <td>Mon</td>
                  <td>
                    <span className="pill pill-ok">Present</span>
                  </td>
                </tr>
                <tr>
                  <td>Tue</td>
                  <td>
                    <span className="pill pill-ok">Present</span>
                  </td>
                </tr>
                <tr>
                  <td>Wed</td>
                  <td>
                    <span className="pill pill-warn">Late</span>
                  </td>
                </tr>
                <tr>
                  <td>Thu</td>
                  <td>
                    <span className="pill pill-neutral">Upcoming</span>
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
