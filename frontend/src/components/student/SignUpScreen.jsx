export default function SignUpScreen({ go }) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-eyebrow">Create your account</div>
        <h1 className="auth-title">Join Masar</h1>
        <div className="field">
          <label>Full name</label>
          <input placeholder="Nour Ahmed" />
        </div>
        <div className="field">
          <label>Student ID</label>
          <input placeholder="e.g. 22-10453" />
        </div>
        <div className="field">
          <label>School email</label>
          <input placeholder="nour.ahmed@school.edu" />
        </div>
        <div className="field">
          <label>Grade / class</label>
          <select>
            <option>Grade 10 — Section B</option>
            <option>Grade 11 — Section A</option>
          </select>
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" placeholder="Create a password" />
        </div>
        <button className="btn btn-primary btn-block" onClick={() => go("s-home")}>
          Create account
        </button>
        <div className="auth-switch">
          Already have an account? <a onClick={() => go("s-login")}>Log in</a>
        </div>
      </div>
    </div>
  );
}
