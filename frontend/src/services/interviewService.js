import api from "./api";

export async function getInterviewConfigs() {
  const response = await api.get("/interviews/config");
  return Array.isArray(response.data) ? response.data : [];
}

export async function saveInterviewConfig(config) {
  const response = await api.post("/interviews/config", config);
  return response.data;
}

export async function startInterview(configId) {
  const response = await api.post(`/interviews/start/${configId}`);
  return response.data;
}

export function getInterviewError(error) {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return data?.message || data?.detail || error?.message || "Something went wrong. Please try again.";
}

export async function getInterviewSession(sessionId) {
  const response = await api.get(`/interviews/session/${sessionId}`);
  return response.data;
}

export async function submitInterviewAnswer(sessionId, questionId, answer) {
  const response = await api.post(`/interviews/session/${sessionId}/answers`, { questionId, answer });
  return response.data;
}

export async function completeInterview(sessionId) {
  const response = await api.post(`/interviews/session/${sessionId}/complete`);
  return response.data;
}

export async function recordIntegrityEvent(sessionId, event) {
  const response = await api.post(`/interviews/session/${sessionId}/integrity-events`, event);
  return response.data;
}

export async function terminateInterview(sessionId, reason) {
  const response = await api.post(`/interviews/session/${sessionId}/terminate`, { reason });
  return response.data;
}
