import api from "./api";

export async function getInterviewHistory() {
  const response = await api.get("/interviews/history");
  const body = response.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.content)) return body.content;
  if (Array.isArray(body?.history)) return body.history;
  if (Array.isArray(body?.sessions)) return body.sessions;
  if (Array.isArray(body?.data)) return body.data;
  return [];
}

export function getWorkspaceError(error) {
  const body = error?.response?.data;
  if (typeof body === "string" && body.trim()) return body;
  return body?.message || body?.detail || error?.message || "Something went wrong. Please try again.";
}

export function normalizeSession(item) {
  const score = Number(item?.score ?? item?.overallScore ?? item?.evaluation?.score);
  const created = item?.createdAt ?? item?.startedAt ?? item?.date ?? item?.completedAt;
  return {
    ...item,
    id: item?.id ?? item?.sessionId ?? `${created || "session"}-${item?.title || "interview"}`,
    title: item?.title || item?.role || item?.programmingLanguage || item?.interviewType || "Interview practice",
    type: item?.interviewType || item?.type || "Practice",
    date: created,
    score: Number.isFinite(score) ? score : null,
    status: item?.status || (item?.completedAt || item?.completed ? "Completed" : "In progress"),
  };
}
