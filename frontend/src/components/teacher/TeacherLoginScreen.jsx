import { useState } from "react";
import { useAuth } from "../../lib/AuthContext.jsx";

export default function TeacherLoginScreen({ go }) {
  const { loginTeacher } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await loginTeacher(email.trim(), password);
      go("t-attendance");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-eyebrow">Teacher portal</div>
        <h1 className="auth-title">Log in to Masar</h1>
        <div className="field">
          <label>Staff email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="s.hassan@school.edu"
            autoComplete="username"
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        <button className="btn btn-primary btn-block" disabled={busy || !email || !password}>
          {busy ? "Logging in…" : "Log in"}
        </button>
        <div className="auth-switch">
          Teacher accounts are created by the school — run <code>npm run seed</code> for a demo login.
        </div>
      </form>
    </div>
  );
}
