const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function request(path, options = {}, token) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Request failed");
  }
  return response.json();
}

export const api = {
  register: (payload) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  addTopic: (studentId, payload, token) =>
    request(`/topics?student_id=${studentId}`, { method: "POST", body: JSON.stringify(payload) }, token),
  listTopics: (studentId, token, search = "") =>
    request(`/topics?student_id=${studentId}&search=${encodeURIComponent(search)}`, {}, token),
  updateTopic: (topicId, payload, token) =>
    request(`/topics/${topicId}`, { method: "PUT", body: JSON.stringify(payload) }, token),
  deleteTopic: (topicId, token) => request(`/topics/${topicId}`, { method: "DELETE" }, token),
  generatePlan: (studentId, token) =>
    request(`/planner/generate?student_id=${studentId}`, { method: "POST" }, token),
  listPlan: (studentId, token) => request(`/planner/week?student_id=${studentId}`, {}, token),
  updateTask: (taskId, payload, token) =>
    request(`/planner/task/${taskId}`, { method: "PATCH", body: JSON.stringify(payload) }, token),
  addDoubt: (studentId, payload, token) =>
    request(`/doubts?student_id=${studentId}`, { method: "POST", body: JSON.stringify(payload) }, token),
  listDoubts: (studentId, token) => request(`/doubts?student_id=${studentId}`, {}, token),
  studentInsights: (studentId, token) => request(`/insights/student/${studentId}`, {}, token),
  addAiLog: (studentId, payload, token) =>
    request(`/ai-logs?student_id=${studentId}`, { method: "POST", body: JSON.stringify(payload) }, token),
  listAiLogs: (studentId, token) => request(`/ai-logs?student_id=${studentId}`, {}, token),
  deleteAiLog: (logId, token) => request(`/ai-logs/${logId}`, { method: "DELETE" }, token),
  exportAiLogsMarkdown: (studentId, token) => request(`/ai-logs/export?student_id=${studentId}`, {}, token),
};
