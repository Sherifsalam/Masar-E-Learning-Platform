import { useEffect, useState } from "react";
import TeacherSidebar from "./TeacherSidebar.jsx";
import { useAuth } from "../../lib/AuthContext.jsx";
import { attendanceApi, teacherApi } from "../../lib/api.js";
import { useApi, Loading, ErrorMsg, Empty } from "../../lib/useApi.jsx";

const STATUS_PILL = { present: "ok", late: "warn", absent: "bad" };
const STATUSES = ["present", "late", "absent"];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function AttendanceReviewScreen({ go }) {
  const { user } = useAuth();
  const subject = (user && user.subject) || "";

  const [date, setDate] = useState(todayIso());
  const [session, setSession] = useState(null);
  const [sessionError, setSessionError] = useState(null);
  const [opening, setOpening] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const overview = useApi(
    () => teacherApi.attendanceOverview({ subject, date }),
    [subject, date]
  );
  const roster = useApi(() => attendanceApi.roster({ subject, date }), [subject, date]);

  // Count the open session down so it is obvious when the code goes stale.
  useEffect(() => {
    if (!session) return;
    setSecondsLeft(session.expiresInSeconds);
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [session]);

  async function openSession() {
    setOpening(true);
    setSessionError(null);
    try {
      setSession(await attendanceApi.openSession(subject));
    } catch (err) {
      setSessionError(err.message);
    } finally {
      setOpening(false);
    }
  }

  async function setStatus(record, status) {
    try {
      await attendanceApi.updateStatus(record._id, status);
      roster.reload();
      overview.reload();
    } catch (err) {
      setSessionError(err.message);
    }
  }

  return (
    <div className="app-shell">
      <TeacherSidebar active="t-attendance" go={go} />
      <main className="main">
        <div className="main-head">
          <div>
            <div className="main-title">Attendance — {subject || "your class"}</div>
            <div className="main-sub">
              {new Date(date).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid var(--border-strong)", fontSize: 13 }}
          />
        </div>

        <div className="qr-hero">
          <div className="qr-hero-text">
            <h2>Open a check-in session</h2>
            <p>
              Students scan this code — or type the text below it — to mark themselves present. Arrivals
              after 10 minutes are recorded as late.
            </p>
            {session && secondsLeft > 0 && (
              <p className="session-code">
                Code: <code>{session.sessionToken}</code> · expires in {Math.floor(secondsLeft / 60)}:
                {String(secondsLeft % 60).padStart(2, "0")}
              </p>
            )}
            {session && secondsLeft === 0 && <p className="session-code">This code has expired.</p>}
          </div>
          {session && secondsLeft > 0 ? (
            <img src={session.qrDataUrl} alt="Check-in QR code" className="qr-image" />
          ) : (
            <button className="qr-scan-btn" onClick={openSession} disabled={opening || !subject}>
              {opening ? "Opening…" : session ? "Open a new session" : "Start check-in session"}
            </button>
          )}
        </div>
        <ErrorMsg error={sessionError} />

        {overview.loading && <Loading />}
        <ErrorMsg error={overview.error} onRetry={overview.reload} />
        {overview.data && (
          <div className="stat-row">
            <div className="stat-card accent-left">
              <div className="num">{overview.data.totalStudents}</div>
              <div className="lbl">Total students</div>
            </div>
            <div className="stat-card accent-left ok">
              <div className="num">{overview.data.present}</div>
              <div className="lbl">Present</div>
            </div>
            <div className="stat-card accent-left bad">
              <div className="num">{overview.data.absent}</div>
              <div className="lbl">Absent</div>
            </div>
            <div className="stat-card accent-left warn">
              <div className="num">{overview.data.late}</div>
              <div className="lbl">Late</div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-title">
            Class roster{" "}
            <span className="pill pill-neutral">{roster.data ? roster.data.length : 0} checked in</span>
          </div>

          {roster.loading && <Loading />}
          <ErrorMsg error={roster.error} onRetry={roster.reload} />
          {roster.data && !roster.data.length && (
            <Empty label="Nobody has checked in for this date yet." />
          )}

          {!!(roster.data && roster.data.length) && (
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Check-in time</th>
                  <th>Status</th>
                  <th>Change status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {roster.data.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="name-cell">
                        <div className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>
                          {(r.student && r.student.avatarInitials) || "??"}
                        </div>
                        {r.student ? r.student.fullName : "Unknown student"}
                      </div>
                    </td>
                    <td>
                      {r.checkInTime
                        ? new Date(r.checkInTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
                        : "—"}
                    </td>
                    <td>
                      <span className={"pill pill-" + (STATUS_PILL[r.status] || "neutral")}>{r.status}</span>
                    </td>
                    <td>
                      <select value={r.status} onChange={(e) => setStatus(r, e.target.value)}>
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => go("t-students", r.student && r.student._id)}
                      >
                        View
                      </button>
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
