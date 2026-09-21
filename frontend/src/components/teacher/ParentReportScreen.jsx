import { useEffect, useState } from "react";
import TeacherSidebar from "./TeacherSidebar.jsx";
import { useAuth } from "../../lib/AuthContext.jsx";
import { reportApi, studentApi } from "../../lib/api.js";
import { useApi, Loading, ErrorMsg, Empty } from "../../lib/useApi.jsx";

const SEND_METHODS = [
  { id: "email", label: "Email", icon: "📧" },
  { id: "sms", label: "SMS", icon: "💬" },
  { id: "whatsapp", label: "WhatsApp", icon: "📱" },
];

function periodOptions() {
  const now = new Date();
  const month = now.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  return [`This month — ${month}`, "This term", "This school year"];
}

export default function ParentReportScreen({ go, studentId }) {
  const { user } = useAuth();
  const periods = periodOptions();

  const [selectedId, setSelectedId] = useState(studentId || "");
  const [period, setPeriod] = useState(periods[0]);
  const [sendMethod, setSendMethod] = useState("email");
  const [include, setInclude] = useState({
    attendance: true,
    grades: true,
    lectureEngagement: true,
    behaviorNotes: false,
  });
  const [teacherNote, setTeacherNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [sent, setSent] = useState(null);

  const students = useApi(() => studentApi.search(""), []);

  useEffect(() => {
    if (!selectedId && students.data && students.data.length) setSelectedId(students.data[0]._id);
  }, [students.data, selectedId]);

  // The preview shows the same figures the API will snapshot into the report.
  const profile = useApi(() => (selectedId ? studentApi.profile(selectedId) : null), [selectedId]);

  const toggle = (key) => () => setInclude((inc) => ({ ...inc, [key]: !inc[key] }));

  async function send() {
    setSending(true);
    setSendError(null);
    setSent(null);
    try {
      const report = await reportApi.send({
        studentId: selectedId,
        period,
        include,
        teacherNote,
        sendMethod,
      });
      setSent(report);
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }

  const student = profile.data && profile.data.student;

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
              {students.loading ? (
                <Loading />
              ) : (
                <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                  {(students.data || []).map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.fullName} — {s.grade}, {s.section}
                    </option>
                  ))}
                </select>
              )}
              <ErrorMsg error={students.error} onRetry={students.reload} />
            </div>

            <div className="field">
              <label>Period</label>
              <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                {periods.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>

            <label className="section-label">Include in report</label>
            <div className="check-row">
              <input type="checkbox" checked={include.attendance} onChange={toggle("attendance")} /> Attendance summary
            </div>
            <div className="check-row">
              <input type="checkbox" checked={include.grades} onChange={toggle("grades")} /> Grades &amp; quiz scores
            </div>
            <div className="check-row">
              <input
                type="checkbox"
                checked={include.lectureEngagement}
                onChange={toggle("lectureEngagement")}
              />{" "}
              Lecture engagement
            </div>
            <div className="check-row">
              <input type="checkbox" checked={include.behaviorNotes} onChange={toggle("behaviorNotes")} /> Behavior notes
            </div>

            <div className="field" style={{ marginTop: 14 }}>
              <label>Teacher note (optional)</label>
              <textarea
                value={teacherNote}
                onChange={(e) => setTeacherNote(e.target.value)}
                placeholder="Add a personal note for the parent…"
              />
            </div>

            <label className="section-label" style={{ marginTop: 14 }}>
              Send via
            </label>
            <div className="send-methods">
              {SEND_METHODS.map((m) => (
                <div
                  key={m.id}
                  className={"send-method" + (sendMethod === m.id ? " sel" : "")}
                  onClick={() => setSendMethod(m.id)}
                >
                  {m.icon} {m.label}
                </div>
              ))}
            </div>
          </div>

          <div className="report-preview">
            {profile.loading && <Loading />}
            <ErrorMsg error={profile.error} onRetry={profile.reload} />
            {!selectedId && !profile.loading && <Empty label="Pick a student to build a report." />}

            {profile.data && (
              <>
                <h3>Progress report</h3>
                <div className="sub">
                  {student.fullName} · {student.grade}, {student.section} · {period}
                </div>

                {include.attendance && (
                  <div className="report-block">
                    <h4>Attendance</h4>
                    <p style={{ fontSize: 13.5 }}>
                      Present {profile.data.attendance.presentDays}/{profile.data.attendance.totalDays} days (
                      {profile.data.attendance.attendanceRate}%).
                    </p>
                  </div>
                )}

                {include.grades && (
                  <div className="report-block">
                    <h4>Grades &amp; quizzes</h4>
                    <p style={{ fontSize: 13.5 }}>
                      Overall average{" "}
                      {profile.data.overallAverage === null
                        ? "not available yet"
                        : `${profile.data.overallAverage}%`}
                      {profile.data.recentQuizScores.length
                        ? `. Latest quiz: ${profile.data.recentQuizScores[0].quizTitle} — ${profile.data.recentQuizScores[0].scorePercent}%.`
                        : "."}
                    </p>
                  </div>
                )}

                {include.lectureEngagement && (
                  <div className="report-block">
                    <h4>Lecture engagement</h4>
                    <p style={{ fontSize: 13.5 }}>
                      Attendance streak of {profile.data.attendance.streak} sessions. Lecture completion counts
                      are calculated and included when the report is sent.
                    </p>
                  </div>
                )}

                {teacherNote && (
                  <div className="report-block">
                    <h4>Note from {user ? user.fullName : "the teacher"}</h4>
                    <p style={{ fontSize: 13.5 }}>{teacherNote}</p>
                  </div>
                )}

                <ErrorMsg error={sendError} />
                {sent && (
                  <div className="form-success">
                    Report saved and sent via {sent.sendMethod}
                    {sent.sendMethod === "email" && student.parentEmail ? ` to ${student.parentEmail}` : ""}.
                  </div>
                )}

                <button
                  className="btn btn-primary btn-block"
                  style={{ marginTop: 6 }}
                  disabled={sending || !selectedId}
                  onClick={send}
                >
                  {sending ? "Sending…" : "Send report to parent"}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
