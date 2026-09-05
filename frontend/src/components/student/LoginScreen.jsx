export default function LoginScreen({ go }) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-eyebrow">Welcome back</div>
        <h1 className="auth-title">Log in to Masar</h1>
        <div className="field">
          <label>Student ID or email</label>
          <input placeholder="nour.ahmed@school.edu" />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" placeholder="••••••••" />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <label style={{ fontSize: 12.5, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" /> Stay signed in
          </label>
          <a style={{ fontSize: 12.5, color: "var(--primary)", fontWeight: 600, textDecoration: "none", cursor: "pointer" }}>
            Forgot password?
          </a>
        </div>
        <button className="btn btn-primary btn-block" onClick={() => go("s-home")}>
          Log in
        </button>
        <div className="auth-switch">
          New here? <a onClick={() => go("s-signup")}>Create an account</a>
        </div>
      </div>
    </div>
  );
}
