const BASE_URL = "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
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
  addTopic: (studentId, payload) =>
    request(`/topics?student_id=${studentId}`, { method: "POST", body: JSON.stringify(payload) }),
  listTopics: (studentId) => request(`/topics?student_id=${studentId}`),
  generatePlan: (studentId) => request(`/planner/generate?student_id=${studentId}`, { method: "POST" }),
  listPlan: (studentId) => request(`/planner/week?student_id=${studentId}`),
  updateTask: (taskId, payload) =>
    request(`/planner/task/${taskId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  addDoubt: (studentId, payload) =>
    request(`/doubts?student_id=${studentId}`, { method: "POST", body: JSON.stringify(payload) }),
  listDoubts: (studentId) => request(`/doubts?student_id=${studentId}`),
  studentInsights: (studentId) => request(`/insights/student/${studentId}`),
};
