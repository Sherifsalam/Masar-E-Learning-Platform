import { useState } from "react";
import { useAuth } from "../../lib/AuthContext.jsx";

export default function LoginScreen({ go }) {
  const { loginStudent } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await loginStudent(identifier.trim(), password);
      go("s-home");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-eyebrow">Welcome back</div>
        <h1 className="auth-title">Log in to Masar</h1>
        <div className="field">
          <label>Student ID or email</label>
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="nour.ahmed@school.edu"
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
        <button className="btn btn-primary btn-block" disabled={busy || !identifier || !password}>
          {busy ? "Logging in…" : "Log in"}
        </button>
        <div className="auth-switch">
          New here? <a onClick={() => go("s-signup")}>Create an account</a>
        </div>
      </form>
    </div>
  );
}
