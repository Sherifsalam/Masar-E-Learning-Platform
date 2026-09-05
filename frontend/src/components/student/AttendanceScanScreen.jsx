import StudentSidebar from "./StudentSidebar.jsx";
import { CheckIcon } from "../shared/Icons.jsx";

export default function AttendanceScanScreen({ go }) {
  return (
    <div className="app-shell">
      <StudentSidebar active="s-scan" go={go} />
      <main className="main">
        <div className="main-head">
          <div>
            <div className="main-title">Check in to Biology 101</div>
            <div className="main-sub">Point your camera at the QR code on the classroom screen</div>
          </div>
        </div>
        <div className="grid-2">
          <div className="card">
            <div className="scan-wrap">
              <div className="scan-frame">
                <div className="scan-corner c1" />
                <div className="scan-corner c2" />
                <div className="scan-corner c3" />
                <div className="scan-corner c4" />
                <div className="scan-line" />
              </div>
              <p style={{ marginTop: 16, fontSize: 12.5, color: "var(--ink-faint)" }}>
                Camera preview — align the code inside the frame
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-title">Checked in ✓</div>
            <div style={{ textAlign: "center", padding: "10px 0 6px" }}>
              <div className="success-check">
                <CheckIcon />
              </div>
              <h3 style={{ fontSize: 17, marginBottom: 4 }}>You're marked present</h3>
              <p style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>Biology 101 · Room 214 · 9:02 AM</p>
            </div>
            <div
              style={{
                borderTop: "1px solid var(--border)",
                marginTop: 16,
                paddingTop: 14,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
              }}
            >
              <span style={{ color: "var(--ink-faint)" }}>Current streak</span>
              <span style={{ fontWeight: 700 }}>12 days 🔥</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
