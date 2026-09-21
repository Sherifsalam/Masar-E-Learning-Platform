import { useState } from "react";
import { useAuth } from "../../lib/AuthContext.jsx";

// Matches the grade/section pair the API stores as two separate fields.
const CLASSES = [
  { label: "Grade 10 — Section B", grade: "Grade 10", section: "Section B" },
  { label: "Grade 11 — Section A", grade: "Grade 11", section: "Section A" },
];

export default function SignUpScreen({ go }) {
  const { signupStudent } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    studentId: "",
    email: "",
    classIndex: 0,
    password: "",
  });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const klass = CLASSES[Number(form.classIndex)];
    try {
      await signupStudent({
        fullName: form.fullName.trim(),
        studentId: form.studentId.trim(),
        email: form.email.trim(),
        grade: klass.grade,
        section: klass.section,
        password: form.password,
      });
      go("s-home");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const complete = form.fullName && form.studentId && form.email && form.password;

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-eyebrow">Create your account</div>
        <h1 className="auth-title">Join Masar</h1>
        <div className="field">
          <label>Full name</label>
          <input value={form.fullName} onChange={set("fullName")} placeholder="Nour Ahmed" />
        </div>
        <div className="field">
          <label>Student ID</label>
          <input value={form.studentId} onChange={set("studentId")} placeholder="e.g. 22-10453" />
        </div>
        <div className="field">
          <label>School email</label>
          <input value={form.email} onChange={set("email")} placeholder="nour.ahmed@school.edu" />
        </div>
        <div className="field">
          <label>Grade / class</label>
          <select value={form.classIndex} onChange={set("classIndex")}>
            {CLASSES.map((c, i) => (
              <option key={c.label} value={i}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={set("password")}
            placeholder="Create a password"
            autoComplete="new-password"
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        <button className="btn btn-primary btn-block" disabled={busy || !complete}>
          {busy ? "Creating account…" : "Create account"}
        </button>
        <div className="auth-switch">
          Already have an account? <a onClick={() => go("s-login")}>Log in</a>
        </div>
      </form>
    </div>
  );
}
