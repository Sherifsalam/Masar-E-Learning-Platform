export default function TeacherLoginScreen({ go }) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-eyebrow">Teacher portal</div>
        <h1 className="auth-title">Log in to Masar</h1>
        <div className="field">
          <label>Staff email</label>
          <input placeholder="s.hassan@school.edu" />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" placeholder="••••••••" />
        </div>
        <button className="btn btn-primary btn-block" onClick={() => go("t-attendance")}>
          Log in
        </button>
        <div className="auth-switch">
          Trouble signing in? <a>Contact IT admin</a>
        </div>
      </div>
    </div>
  );
}
