// Thin wrapper around the Masar REST API.
//
// In dev, BASE is left empty and Vite proxies /api + /uploads to the Express
// server (see vite.config.js). Set VITE_API_URL to point at a deployed API.
const BASE = import.meta.env.VITE_API_URL || "";

const TOKEN_KEY = "masar.token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(method, path, { body, query, raw } = {}) {
  const url = new URL(BASE + "/api" + path, window.location.origin);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
  }

  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (body instanceof FormData) {
    payload = body; // let the browser set the multipart boundary
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(url, { method, headers, body: payload });

  if (raw) {
    if (!res.ok) throw new ApiError(res.status, "Request failed");
    return res;
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    // Non-JSON response (proxy error page, etc.)
  }

  if (!res.ok) {
    if (res.status === 401) setToken(null);
    throw new ApiError(res.status, (json && json.message) || `Request failed (${res.status})`);
  }

  // Every controller answers with { success, message, data }.
  return json ? json.data : null;
}

export const api = {
  get: (path, query) => request("GET", path, { query }),
  post: (path, body) => request("POST", path, { body }),
  patch: (path, body) => request("PATCH", path, { body }),
  del: (path) => request("DELETE", path),
  raw: (path, query) => request("GET", path, { query, raw: true }),
};

// ---------------------------------------------------------------- endpoints

export const authApi = {
  studentSignup: (payload) => api.post("/auth/student/signup", payload),
  studentLogin: (identifier, password) => api.post("/auth/student/login", { identifier, password }),
  teacherLogin: (email, password) => api.post("/auth/teacher/login", { email, password }),
  me: () => api.get("/auth/me"),
};

export const studentApi = {
  dashboard: () => api.get("/students/me/dashboard"),
  search: (q, grade, section) => api.get("/students", { q, grade, section }),
  profile: (id) => api.get(`/students/${id}`),
};

export const teacherApi = {
  attendanceOverview: (params) => api.get("/teachers/me/attendance-overview", params),
};

export const attendanceApi = {
  openSession: (subject) => api.post("/attendance/session", { subject }),
  checkIn: (sessionToken) => api.post("/attendance/check-in", { sessionToken }),
  myHistory: (params) => api.get("/attendance/me/history", params),
  myStats: () => api.get("/attendance/me/stats"),
  roster: (params) => api.get("/attendance/roster", params),
  updateStatus: (id, status) => api.patch(`/attendance/${id}`, { status }),
};

export const lectureApi = {
  list: (subject) => api.get("/lectures", { subject }),
  getOne: (id) => api.get(`/lectures/${id}`),
  continueWatching: () => api.get("/lectures/continue-watching"),
  updateProgress: (id, watchedPercent) => api.patch(`/lectures/${id}/progress`, { watchedPercent }),
  create: (payload) => api.post("/lectures", payload),

  // Prepaid access codes bought at the centre.
  redeem: (code) => api.post("/lectures/redeem", { code }),
  createCodes: (id, count, note) => api.post(`/lectures/${id}/codes`, { count, note }),
  listCodes: (id) => api.get(`/lectures/${id}/codes`),
};

export const fileApi = {
  list: (params) => api.get("/files", params),
  downloadUrl: (id) => `${BASE}/api/files/${id}/download`,
  remove: (id) => api.del(`/files/${id}`),
};

export const quizApi = {
  list: () => api.get("/quizzes"),
  getOne: (id) => api.get(`/quizzes/${id}`),
  create: (payload) => api.post("/quizzes", payload),
  update: (id, updates) => api.patch(`/quizzes/${id}`, updates),
  publish: (id) => api.post(`/quizzes/${id}/publish`),
  remove: (id) => api.del(`/quizzes/${id}`),
  results: (id) => api.get(`/quizzes/${id}/results`),
  startAttempt: (id) => api.post(`/quizzes/${id}/attempts`),
  myAttempt: (id) => api.get(`/quizzes/${id}/my-attempt`),
  submitAttempt: (attemptId, answers) => api.post(`/quizzes/attempts/${attemptId}/submit`, { answers }),
};

export const reportApi = {
  send: (payload) => api.post("/reports", payload),
  history: (studentId) => api.get(`/reports/${studentId}`),
};
