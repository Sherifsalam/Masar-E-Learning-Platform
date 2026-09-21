import StudentSidebar from "./StudentSidebar.jsx";
import { QrIcon } from "../shared/Icons.jsx";
import { useAuth } from "../../lib/AuthContext.jsx";
import { useApi, Loading, ErrorMsg, Empty } from "../../lib/useApi.jsx";
import { attendanceApi, fileApi, lectureApi, quizApi, studentApi } from "../../lib/api.js";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STATUS_PILL = { present: "ok", late: "warn", absent: "bad" };

function firstName(fullName) {
  return (fullName || "").split(" ")[0] || "there";
}

export default function HomeScreen({ go }) {
  const { user } = useAuth();

  const { data, error, loading, reload } = useApi(async () => {
    const [dashboard, continueWatching, files, quizzes, history] = await Promise.all([
      studentApi.dashboard(),
      lectureApi.continueWatching(),
      fileApi.list(),
      quizApi.list(),
      attendanceApi.myHistory(),
    ]);
    return { dashboard, continueWatching, files, quizzes, history };
  }, []);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="app-shell">
      <StudentSidebar active="s-home" go={go} />
      <main className="main">
        <div className="main-head">
          <div>
            <div className="main-title">Good day, {firstName(user && user.fullName)} 👋</div>
            <div className="main-sub">{today}</div>
          </div>
        </div>

        <div className="qr-hero">
          <div className="qr-hero-text">
            <h2>Ready to check in?</h2>
            <p>Scan the QR code shown on the classroom screen to mark yourself present. It only takes a few seconds.</p>
          </div>
          <button className="qr-scan-btn" onClick={() => go("s-scan")}>
            <QrIcon />
            Scan QR to check in
          </button>
        </div>

        {loading && <Loading />}
        <ErrorMsg error={error} onRetry={reload} />

        {data && <HomeBody data={data} go={go} />}
      </main>
    </div>
  );
}

function HomeBody({ data, go }) {
  const { dashboard, continueWatching, files, quizzes, history } = data;

  const pendingQuizzes = quizzes.filter((q) => q.myAttemptStatus !== "completed").length;
  const thisWeek = weekOf(history);

  return (
    <>
      <div className="stat-row">
        <div className="stat-card accent-left ok">
          <div className="num">{dashboard.attendance.attendanceRate}%</div>
          <div className="lbl">Attendance rate</div>
        </div>
        <div className="stat-card accent-left">
          <div className="num">{dashboard.lecturesWatched}</div>
          <div className="lbl">Lectures watched</div>
        </div>
        <div className="stat-card accent-left">
          <div className="num">{files.length}</div>
          <div className="lbl">Saved files</div>
        </div>
        <div className="stat-card accent-left warn">
          <div className="num">{pendingQuizzes}</div>
          <div className="lbl">Quizzes still to take</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">
            Continue watching{" "}
            <span className="pill pill-info">{continueWatching.length} in progress</span>
          </div>
          {!continueWatching.length && <Empty label="No lectures in progress." />}
          {continueWatching.map((p) => (
            <div className="file-row" key={p._id} onClick={() => go("s-lectures")} style={{ cursor: "pointer" }}>
              <div className="file-icon" style={{ background: "var(--primary)" }}>
                ▶
              </div>
              <div style={{ flex: 1 }}>
                <div className="file-name">{p.lecture ? p.lecture.title : "Lecture"}</div>
                <div className="progress-track" style={{ marginTop: 6, width: 200 }}>
                  <div className="progress-fill" style={{ width: p.watchedPercent + "%" }} />
                </div>
              </div>
              <span className="pill pill-neutral">{p.watchedPercent}%</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">This week's attendance</div>
          {!thisWeek.length && <Empty label="No check-ins recorded this week yet." />}
          {!!thisWeek.length && (
            <table>
              <tbody>
                {thisWeek.map((r) => (
                  <tr key={r._id}>
                    <td>{DAY_LABELS[new Date(r.date).getDay()]}</td>
                    <td>{r.subject}</td>
                    <td>
                      <span className={"pill pill-" + (STATUS_PILL[r.status] || "neutral")}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

// History comes back newest-first; keep only the current Sunday-started week.
function weekOf(history) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return history.filter((r) => new Date(r.date) >= start).reverse();
}
