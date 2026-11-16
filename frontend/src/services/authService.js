
import api from "./api";

export async function loginUser({ email, password }) {
  const response = await api.post("/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });

  return response.data;
}

export async function registerUser({ name, email, password }) {
  const response = await api.post("/auth/register", {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
  });

  return response.data;
}

export async function getProtectedTest() {
  const response = await api.get("/protected");
  return response.data;
}

export function getApiError(error) {
  const data = error.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return (
    data?.message ||
    data?.detail ||
    error.message ||
    "Something went wrong. Please try again."
  );
}
