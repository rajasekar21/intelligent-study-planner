import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { api } from "./api";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

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
              <LoginPage
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
              <RegisterPage
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
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <DashboardPage
                user={user}
                error={error}
                insights={insights}
                topicForm={topicForm}
                setTopicForm={setTopicForm}
                handleAddTopic={handleAddTopic}
                doubtForm={doubtForm}
                setDoubtForm={setDoubtForm}
                handleAddDoubt={handleAddDoubt}
                topics={topics}
                topicSearch={topicSearch}
                setTopicSearch={setTopicSearch}
                editTopicId={editTopicId}
                editTopicForm={editTopicForm}
                setEditTopicForm={setEditTopicForm}
                handleSaveEditTopic={handleSaveEditTopic}
                setEditTopicId={setEditTopicId}
                handleStartEditTopic={handleStartEditTopic}
                handleDeleteTopic={handleDeleteTopic}
                tasks={tasks}
                handleTaskStatus={handleTaskStatus}
                doubts={doubts}
                aiLogForm={aiLogForm}
                setAiLogForm={setAiLogForm}
                handleAddAiLog={handleAddAiLog}
                handleGeneratePlan={handleGeneratePlan}
                handleLogout={handleLogout}
                aiLogs={aiLogs}
                aiExportMarkdown={aiExportMarkdown}
                handleExportAiLogs={handleExportAiLogs}
                handleCopyAiExport={handleCopyAiExport}
                handleDeleteAiLog={handleDeleteAiLog}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </div>
  );
}
