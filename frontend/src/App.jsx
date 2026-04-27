import { useEffect, useState } from "react";
import { api } from "./api";

const defaultTopic = { subject: "", title: "", deadline: "", difficulty: 3 };
const defaultDoubt = { topic_id: "", title: "", description: "" };

export default function App() {
  const [mode, setMode] = useState("login");
  const [user, setUser] = useState(null);
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const studentId = user?.id;

  const loadDashboard = async () => {
    if (!studentId) return;
    const [topicData, taskData, doubtData, insightData] = await Promise.all([
      api.listTopics(studentId),
      api.listPlan(studentId),
      api.listDoubts(studentId),
      api.studentInsights(studentId),
    ]);
    setTopics(topicData);
    setTasks(taskData);
    setDoubts(doubtData);
    setInsights(insightData);
  };

  useEffect(() => {
    loadDashboard().catch(() => {});
  }, [studentId]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const created = await api.register(authForm);
      setUser(created);
      setMode("dashboard");
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
      setMode("dashboard");
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
      await api.addTopic(studentId, topicForm);
      setTopicForm(defaultTopic);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGeneratePlan = async () => {
    setError("");
    try {
      await api.generatePlan(studentId);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTaskStatus = async (taskId, status) => {
    await api.updateTask(taskId, { status });
    await loadDashboard();
  };

  const handleAddDoubt = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.addDoubt(studentId, {
        ...doubtForm,
        topic_id: doubtForm.topic_id ? Number(doubtForm.topic_id) : null,
      });
      setDoubtForm(defaultDoubt);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h1>Intelligent Study Planner and Doubt Tracker</h1>

      {mode !== "dashboard" ? (
        <div className="card">
          <div className="toggle">
            <button onClick={() => setMode("login")} className={mode === "login" ? "active" : ""}>
              Login
            </button>
            <button onClick={() => setMode("register")} className={mode === "register" ? "active" : ""}>
              Register
            </button>
          </div>
          <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
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
        </div>
      ) : (
        <>
          <div className="card">
            <p>
              Logged in as <strong>{user?.name}</strong> ({user?.role})
            </p>
            <button onClick={handleGeneratePlan}>Generate AI Weekly Plan</button>
          </div>

          <div className="grid">
            <section className="card">
              <h2>Add Syllabus Topic</h2>
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
              <h2>Raise Doubt</h2>
              <form onSubmit={handleAddDoubt}>
                <label>Topic ID (optional)</label>
                <input
                  value={doubtForm.topic_id}
                  onChange={(e) => setDoubtForm({ ...doubtForm, topic_id: e.target.value })}
                />
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
              <h2>Topics</h2>
              {topics.length === 0 ? (
                <p>No topics added yet.</p>
              ) : (
                <ul>
                  {topics.map((topic) => (
                    <li key={topic.id}>
                      <strong>{topic.subject}</strong> - {topic.title} (deadline: {topic.deadline})
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card">
              <h2>Weekly Tasks</h2>
              {tasks.length === 0 ? (
                <p>No tasks generated yet.</p>
              ) : (
                <ul>
                  {tasks.map((task) => (
                    <li key={task.id}>
                      Task #{task.id} | Topic #{task.topic_id} | {task.task_date} | {task.status}
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
              <h2>Doubts</h2>
              {doubts.length === 0 ? (
                <p>No doubts raised.</p>
              ) : (
                <ul>
                  {doubts.map((doubt) => (
                    <li key={doubt.id}>
                      <strong>{doubt.title}</strong> - {doubt.status}
                      <p>{doubt.description}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card">
              <h2>Performance Insights</h2>
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
        </>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}
