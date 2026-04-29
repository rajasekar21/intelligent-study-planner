export default function AuthForm({
  mode,
  onSubmit,
  authForm,
  setAuthForm,
  loading,
  error,
  onSwitchMode,
}) {
  return (
    <div className="card auth-card">
      <p className="muted-text">Welcome to your AI learning workspace</p>
      <h2>{mode === "login" ? "Login" : "Register"}</h2>
      <form onSubmit={onSubmit}>
        {mode === "register" && (
          <>
            <label>Name</label>
            <input
              value={authForm.name}
              onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
              required
            />
            <label>Role</label>
            <select value={authForm.role} onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}>
              <option value="student">student</option>
              <option value="mentor">mentor</option>
            </select>
          </>
        )}
        <label>Email</label>
        <input
          type="email"
          value={authForm.email}
          onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
          required
        />
        <label>Password</label>
        <input
          type="password"
          value={authForm.password}
          onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
        </button>
      </form>
      <div className="auth-switch">
        {mode === "login" ? (
          <button className="secondary-btn" onClick={() => onSwitchMode("register")}>
            New user? Go to Register
          </button>
        ) : (
          <button className="secondary-btn" onClick={() => onSwitchMode("login")}>
            Already registered? Go to Login
          </button>
        )}
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
