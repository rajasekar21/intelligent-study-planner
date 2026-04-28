import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { api } from "./api";

const defaultTopic = { subject: "", title: "", deadline: "", difficulty: 3, is_completed: false };
const defaultDoubt = { topic_id: "", title: "", description: "" };
const defaultAiLog = {
  tool_name: "Cursor",
  prompt_text: "",
  completion_summary: "",
  action_taken: "",
  files_impacted: "",
  used_in_code: true,
  notes: "",
};

function AuthForm({ mode, onSubmit, authForm, setAuthForm, loading, error, onSwitchMode }) {
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
              <option value="admin">admin</option>
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

export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [topicForm, setTopicForm] = useState(defaultTopic);
  const [doubtForm, setDoubtForm] = useState(defaultDoubt);
  const [topics, setTopics] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [insights, setInsights] = useState(null);
  const [aiLogs, setAiLogs] = useState([]);
  const [aiLogForm, setAiLogForm] = useState(defaultAiLog);
  const [aiExportMarkdown, setAiExportMarkdown] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [topicSearch, setTopicSearch] = useState("");
  const [editTopicId, setEditTopicId] = useState(null);
  const [editTopicForm, setEditTopicForm] = useState(defaultTopic);

  const studentId = user?.id;
  const isLoggedIn = useMemo(() => Boolean(user && token), [user, token]);

  const loadDashboard = async () => {
    if (!studentId || !token) return;
    const [topicData, taskData, doubtData, insightData] = await Promise.all([
      api.listTopics(studentId, token, topicSearch),
      api.listPlan(studentId, token),
      api.listDoubts(studentId, token),
      api.studentInsights(studentId, token),
    ]);
    const logs = await api.listAiLogs(studentId, token);
    setTopics(topicData);
    setTasks(taskData);
    setDoubts(doubtData);
    setInsights(insightData);
    setAiLogs(logs);
  };

  useEffect(() => {
    loadDashboard().catch(() => {});
  }, [studentId, token, topicSearch]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const created = await api.register(authForm);
      setUser(created);
      setToken("");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api.login({ email: authForm.email, password: authForm.password });
      setUser(result.user);
      setToken(result.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.addTopic(studentId, topicForm, token);
      setTopicForm(defaultTopic);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGeneratePlan = async () => {
    setError("");
    try {
      await api.generatePlan(studentId, token);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTaskStatus = async (taskId, status) => {
    await api.updateTask(taskId, { status }, token);
    await loadDashboard();
  };

  const handleAddDoubt = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.addDoubt(
        studentId,
        {
          ...doubtForm,
          topic_id: doubtForm.topic_id ? Number(doubtForm.topic_id) : null,
        },
        token
      );
      setDoubtForm(defaultDoubt);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    setError("");
    try {
      await api.deleteTopic(topicId, token);
      if (editTopicId === topicId) {
        setEditTopicId(null);
        setEditTopicForm(defaultTopic);
      }
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStartEditTopic = (topic) => {
    setEditTopicId(topic.id);
    setEditTopicForm({
      subject: topic.subject,
      title: topic.title,
      deadline: topic.deadline,
      difficulty: topic.difficulty,
      is_completed: topic.is_completed,
    });
  };

  const handleSaveEditTopic = async (topicId) => {
    setError("");
    try {
      await api.updateTopic(topicId, editTopicForm, token);
      setEditTopicId(null);
      setEditTopicForm(defaultTopic);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken("");
    setTopics([]);
    setTasks([]);
    setDoubts([]);
    setInsights(null);
    setAiLogs([]);
    setAiLogForm(defaultAiLog);
    navigate("/login");
  };

  const handleAddAiLog = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.addAiLog(
        studentId,
        {
          ...aiLogForm,
          files_impacted: aiLogForm.files_impacted || null,
          notes: aiLogForm.notes || null,
        },
        token
      );
      setAiLogForm(defaultAiLog);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAiLog = async (logId) => {
    setError("");
    try {
      await api.deleteAiLog(logId, token);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExportAiLogs = async () => {
    setError("");
    try {
      const data = await api.exportAiLogsMarkdown(studentId, token);
      setAiExportMarkdown(data.markdown || "");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCopyAiExport = async () => {
    if (!aiExportMarkdown) return;
    try {
      await navigator.clipboard.writeText(aiExportMarkdown);
    } catch (_err) {
      setError("Copy failed. Please select and copy manually.");
    }
  };

  const dashboardView = (
    <>
      <div className="card">
        <p>
          Logged in as <strong>{user?.name}</strong> ({user?.role})
        </p>
        <div className="actions">
          <button onClick={handleGeneratePlan}>Generate AI Weekly Plan</button>
          <button className="secondary-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {insights && (
        <div className="metrics-grid">
          <div className="metric-card">
            <p className="metric-label">Completion Rate</p>
            <p className="metric-value">{insights.completion_rate}%</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Missed Tasks</p>
            <p className="metric-value">{insights.missed_tasks}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Open Doubts</p>
            <p className="metric-value">{insights.open_doubts}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Risk Level</p>
            <p className="metric-value">{insights.risk_level}</p>
          </div>
        </div>
      )}

      <div className="grid">
        <section className="card">
          <h2 className="section-title">Add Syllabus Topic</h2>
          <form onSubmit={handleAddTopic}>
            <label>Subject</label>
            <input
              value={topicForm.subject}
              onChange={(e) => setTopicForm({ ...topicForm, subject: e.target.value })}
              required
            />
            <label>Topic</label>
            <input
              value={topicForm.title}
              onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
              required
            />
            <label>Deadline</label>
            <input
              type="date"
              value={topicForm.deadline}
              onChange={(e) => setTopicForm({ ...topicForm, deadline: e.target.value })}
              required
            />
            <label>Difficulty (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              value={topicForm.difficulty}
              onChange={(e) => setTopicForm({ ...topicForm, difficulty: Number(e.target.value) })}
            />
            <button type="submit">Add Topic</button>
          </form>
        </section>

        <section className="card">
          <h2 className="section-title">Raise Doubt</h2>
          <form onSubmit={handleAddDoubt}>
            <label>Topic ID (optional)</label>
            <input value={doubtForm.topic_id} onChange={(e) => setDoubtForm({ ...doubtForm, topic_id: e.target.value })} />
            <label>Title</label>
            <input
              value={doubtForm.title}
              onChange={(e) => setDoubtForm({ ...doubtForm, title: e.target.value })}
              required
            />
            <label>Description</label>
            <textarea
              value={doubtForm.description}
              onChange={(e) => setDoubtForm({ ...doubtForm, description: e.target.value })}
              required
            />
            <button type="submit">Submit Doubt</button>
          </form>
        </section>
      </div>

      <div className="grid">
        <section className="card">
          <h2 className="section-title">Topics</h2>
          <label>Search by subject/title</label>
          <input value={topicSearch} onChange={(e) => setTopicSearch(e.target.value)} placeholder="e.g. Math, Arrays..." />
          {topics.length === 0 ? (
            <p>No topics found.</p>
          ) : (
            <ul>
              {topics.map((topic) => (
                <li key={topic.id}>
                  {editTopicId === topic.id ? (
                    <div>
                      <input
                        value={editTopicForm.subject}
                        onChange={(e) => setEditTopicForm({ ...editTopicForm, subject: e.target.value })}
                      />
                      <input value={editTopicForm.title} onChange={(e) => setEditTopicForm({ ...editTopicForm, title: e.target.value })} />
                      <input
                        type="date"
                        value={editTopicForm.deadline}
                        onChange={(e) => setEditTopicForm({ ...editTopicForm, deadline: e.target.value })}
                      />
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={editTopicForm.difficulty}
                        onChange={(e) => setEditTopicForm({ ...editTopicForm, difficulty: Number(e.target.value) })}
                      />
                      <label className="checkbox-line">
                        <input
                          type="checkbox"
                          checked={editTopicForm.is_completed}
                          onChange={(e) => setEditTopicForm({ ...editTopicForm, is_completed: e.target.checked })}
                        />
                        Completed
                      </label>
                      <div className="actions">
                        <button onClick={() => handleSaveEditTopic(topic.id)}>Save</button>
                        <button className="secondary-btn" onClick={() => setEditTopicId(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <strong>{topic.subject}</strong> - {topic.title} (deadline: {topic.deadline})
                      <div className="actions">
                        <button onClick={() => handleStartEditTopic(topic)}>Edit</button>
                        <button className="danger-btn" onClick={() => handleDeleteTopic(topic.id)}>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2 className="section-title">Weekly Tasks</h2>
          {tasks.length === 0 ? (
            <p>No tasks generated yet.</p>
          ) : (
            <ul>
              {tasks.map((task) => (
                <li key={task.id}>
                  <div className="item-row">
                    <span>Task #{task.id}</span>
                    <span className={`status-chip status-${task.status}`}>{task.status}</span>
                  </div>
                  <p>Topic #{task.topic_id} | {task.task_date}</p>
                  <div className="actions">
                    <button onClick={() => handleTaskStatus(task.id, "completed")}>Complete</button>
                    <button onClick={() => handleTaskStatus(task.id, "missed")}>Missed</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid">
        <section className="card">
          <h2 className="section-title">Doubts</h2>
          {doubts.length === 0 ? (
            <p>No doubts raised.</p>
          ) : (
            <ul>
              {doubts.map((doubt) => (
                <li key={doubt.id}>
                  <div className="item-row">
                    <strong>{doubt.title}</strong>
                    <span className={`status-chip status-${doubt.status}`}>{doubt.status}</span>
                  </div>
                  <p>{doubt.description}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2 className="section-title">Performance Insights</h2>
          {!insights ? (
            <p>No insights yet.</p>
          ) : (
            <ul>
              <li>Completion Rate: {insights.completion_rate}%</li>
              <li>Missed Tasks: {insights.missed_tasks}</li>
              <li>Open Doubts: {insights.open_doubts}</li>
              <li>Risk Level: {insights.risk_level}</li>
            </ul>
          )}
        </section>
      </div>

      <div className="grid">
        <section className="card">
          <h2 className="section-title">AI Usage Log (DB)</h2>
          <form onSubmit={handleAddAiLog}>
            <label>Tool Name</label>
            <input
              value={aiLogForm.tool_name}
              onChange={(e) => setAiLogForm({ ...aiLogForm, tool_name: e.target.value })}
              required
            />
            <label>Prompt Used</label>
            <textarea
              value={aiLogForm.prompt_text}
              onChange={(e) => setAiLogForm({ ...aiLogForm, prompt_text: e.target.value })}
              required
            />
            <label>Completion Summary</label>
            <textarea
              value={aiLogForm.completion_summary}
              onChange={(e) => setAiLogForm({ ...aiLogForm, completion_summary: e.target.value })}
              required
            />
            <label>Action Taken</label>
            <textarea
              value={aiLogForm.action_taken}
              onChange={(e) => setAiLogForm({ ...aiLogForm, action_taken: e.target.value })}
              required
            />
            <label>Files Impacted (comma separated)</label>
            <input
              value={aiLogForm.files_impacted}
              onChange={(e) => setAiLogForm({ ...aiLogForm, files_impacted: e.target.value })}
              placeholder="backend/app/main.py, frontend/src/App.jsx"
            />
            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={aiLogForm.used_in_code}
                onChange={(e) => setAiLogForm({ ...aiLogForm, used_in_code: e.target.checked })}
              />
              AI output used in final code
            </label>
            <label>Notes (optional)</label>
            <textarea value={aiLogForm.notes} onChange={(e) => setAiLogForm({ ...aiLogForm, notes: e.target.value })} />
            <button type="submit">Save AI Log</button>
          </form>
        </section>

        <section className="card">
          <h2 className="section-title">Saved AI Logs</h2>
          <div className="actions">
            <button onClick={handleExportAiLogs}>Generate Markdown Export</button>
            <button className="secondary-btn" onClick={handleCopyAiExport} disabled={!aiExportMarkdown}>
              Copy Export
            </button>
          </div>
          {aiExportMarkdown && (
            <>
              <label>Markdown Preview (for LMS report)</label>
              <textarea className="mono-area" value={aiExportMarkdown} readOnly rows={10} />
            </>
          )}
          {aiLogs.length === 0 ? (
            <p>No AI logs recorded yet.</p>
          ) : (
            <ul>
              {aiLogs.map((log) => (
                <li key={log.id}>
                  <strong>{log.tool_name}</strong> - {log.used_in_code ? "Used" : "Not Used"}
                  <p><strong>Prompt:</strong> {log.prompt_text}</p>
                  <p><strong>Completion:</strong> {log.completion_summary}</p>
                  <p><strong>Action:</strong> {log.action_taken}</p>
                  {log.files_impacted && <p><strong>Files:</strong> {log.files_impacted}</p>}
                  {log.notes && <p><strong>Notes:</strong> {log.notes}</p>}
                  <button className="danger-btn" onClick={() => handleDeleteAiLog(log.id)}>
                    Delete Log
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {error && <p className="error">{error}</p>}
    </>
  );

  return (
    <div className="container">
      <h1>AI Powered Study Planner</h1>
      <p className="page-subtitle">Plan smart, track progress, and improve with AI-powered insights.</p>
      <Routes>
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthForm
                mode="login"
                onSubmit={handleLogin}
                authForm={authForm}
                setAuthForm={setAuthForm}
                loading={loading}
                error={error}
                onSwitchMode={(nextMode) => navigate(nextMode === "login" ? "/login" : "/register")}
              />
            )
          }
        />
        <Route
          path="/register"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthForm
                mode="register"
                onSubmit={handleRegister}
                authForm={authForm}
                setAuthForm={setAuthForm}
                loading={loading}
                error={error}
                onSwitchMode={(nextMode) => navigate(nextMode === "login" ? "/login" : "/register")}
              />
            )
          }
        />
        <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} />
        <Route path="/dashboard" element={isLoggedIn ? dashboardView : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </div>
  );
}
