import { useEffect, useState } from "react";
import TeacherSidebar from "./TeacherSidebar.jsx";
import { studentApi } from "../../lib/api.js";
import { useApi, Loading, ErrorMsg, Empty } from "../../lib/useApi.jsx";

function scorePill(score) {
  if (score >= 85) return "ok";
  if (score >= 70) return "warn";
  return "bad";
}

export default function StudentLookupScreen({ go, initialStudentId }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selectedId, setSelectedId] = useState(initialStudentId || null);

  // Keep typing responsive without a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  const list = useApi(() => studentApi.search(debounced), [debounced]);

  // Default to the first result whenever the list changes and nothing is picked.
  useEffect(() => {
    if (!selectedId && list.data && list.data.length) setSelectedId(list.data[0]._id);
  }, [list.data, selectedId]);

  const profile = useApi(
    () => (selectedId ? studentApi.profile(selectedId) : null),
    [selectedId]
  );

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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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

            {list.loading && <Loading />}
            <ErrorMsg error={list.error} onRetry={list.reload} />
            {list.data && !list.data.length && <Empty label="No students matched." />}

            {(list.data || []).map((s) => (
              <div
                key={s._id}
                className="file-row"
                onClick={() => setSelectedId(s._id)}
                style={{
                  cursor: "pointer",
                  borderRadius: 9,
                  padding: "10px 8px",
                  background: s._id === selectedId ? "var(--primary-tint)" : "transparent",
                }}
              >
                <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                  {s.avatarInitials || "??"}
                </div>
                <div>
                  <div className="file-name">{s.fullName}</div>
                  <div className="file-meta">
                    ID {s.studentId} · {s.grade} {s.section}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            {profile.loading && <Loading />}
            <ErrorMsg error={profile.error} onRetry={profile.reload} />
            {!selectedId && !profile.loading && <Empty label="Pick a student to see their record." />}
            {profile.data && <StudentDetail profile={profile.data} go={go} />}
          </div>
        </div>
      </main>
    </div>
  );
}

function StudentDetail({ profile, go }) {
  const { student, attendance, attendanceLast8Weeks, recentQuizScores, overallAverage } = profile;

  return (
    <>
      <div className="detail-head">
        <div className="detail-avatar">{student.avatarInitials || "??"}</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 18 }}>{student.fullName}</h3>
          <p style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>
            Student ID {student.studentId} · {student.grade}, {student.section}
          </p>
        </div>
        <button className="btn btn-accent btn-sm" onClick={() => go("t-reports", student._id)}>
          Generate parent report
        </button>
      </div>

      <div className="kv-grid" style={{ marginBottom: 16 }}>
        <div>
          <div className="k">Parent / guardian</div>
          <div className="v">{student.parentName || "—"}</div>
        </div>
        <div>
          <div className="k">Contact</div>
          <div className="v">{student.parentContact || student.parentEmail || "—"}</div>
        </div>
        <div>
          <div className="k">Overall attendance</div>
          <div className="v">{attendance.attendanceRate}%</div>
        </div>
        <div>
          <div className="k">Overall average grade</div>
          <div className="v">{overallAverage === null ? "—" : `${overallAverage}%`}</div>
        </div>
      </div>

      <h4 className="section-label">Attendance — last 8 weeks</h4>
      {!attendanceLast8Weeks.length ? (
        <Empty label="No attendance recorded yet." />
      ) : (
        <div className="bars">
          {attendanceLast8Weeks.map((w) => (
            <div
              key={w.week}
              className={"bar" + (w.attendanceRate < 70 ? " low" : "")}
              style={{ height: w.attendanceRate + "%" }}
              title={`Week of ${w.week}: ${w.attendanceRate}%`}
            >
              <span style={{ height: w.attendanceRate + "%" }} />
            </div>
          ))}
        </div>
      )}

      <h4 className="section-label" style={{ marginTop: 18 }}>
        Recent quiz scores
      </h4>
      {!recentQuizScores.length ? (
        <Empty label="No completed quizzes yet." />
      ) : (
        <table>
          <tbody>
            {recentQuizScores.map((q, i) => (
              <tr key={i}>
                <td>{q.quizTitle}</td>
                <td style={{ textAlign: "right" }}>
                  <span className={"pill pill-" + scorePill(q.scorePercent)}>{q.scorePercent}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
