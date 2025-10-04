import axios from "axios";

const baseURL = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      localStorage.setItem("auth_token", token);
    } catch {}
  }
}

export function clearAuthToken() {
  delete api.defaults.headers.common["Authorization"];
  try {
    localStorage.removeItem("auth_token");
  } catch {}
}

export async function register(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function verifyOtpApi(payload) {
  const { data } = await api.post("/auth/verify-otp", payload);
  return data;
}

export async function resendOtpApi(payload) {
  const { data } = await api.post("/auth/resend-otp", payload);
  return data;
}

export async function login(payload) {
  const { data } = await api.post("/auth/login", payload);
  return data;
}

export async function forgotPasswordApi(payload) {
  const { data } = await api.post("/auth/forgot-password", payload);
  return data;
}

export async function resetPasswordApi(payload) {
  const { data } = await api.post("/auth/reset-password", payload);
  return data;
}

export async function logout() {
  const { data } = await api.post("/auth/logout", {});
  return data;
}

export default api;


