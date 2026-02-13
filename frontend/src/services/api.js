import axios from "axios";

// Change this to your machine's IP when testing on a physical device
const API_BASE = "http://192.168.31.69:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ─── Auth ────────────────────────────────────────────
export const loginUser = (payload) => api.post("/auth/login", payload);
export const signupUser = (payload) => api.post("/auth/signup", payload);

// ─── Profile ──────────────────────────────────────
export const fetchProfile = (id) => api.get(`/profiles/${id}`);

export const createProfile = (payload) => api.post("/profiles", payload);

export const updateProfile = (id, payload) =>
  api.put(`/profiles/${id}`, payload);

export const updateManifestation = (id, manifestation) =>
  api.put(`/profiles/${id}/manifestation`, { manifestation });

export const uploadAvatar = (id, base64Image) =>
  api.put(`/profiles/${id}/avatar`, { base64Image });

// ─── Habits ───────────────────────────────────────
export const fetchHabits = (profileId) => api.get(`/habits/${profileId}`);

export const createHabit = (payload) => api.post("/habits", payload);

export const toggleHabit = (id) => api.put(`/habits/${id}/toggle`);

export const deleteHabit = (id) => api.delete(`/habits/${id}`);

export const fetchHabitLogs = (id) => api.get(`/habits/${id}/logs`);

// ─── Debts ────────────────────────────────────────
export const fetchDebts = (profileId) => api.get(`/debts/${profileId}`);

export const createDebt = (payload) => api.post("/debts", payload);

export const recordPayment = (id, payload) =>
  api.post(`/debts/${id}/pay`, payload);

export const fetchPayments = (id) => api.get(`/debts/${id}/payments`);

export const deleteDebt = (id) => api.delete(`/debts/${id}`);

// ─── Interviews ─────────────────────────────────
export const fetchInterviews = (profileId) =>
  api.get(`/interviews/${profileId}`);

export const createInterview = (payload) => api.post("/interviews", payload);

export const updateInterview = (id, payload) =>
  api.put(`/interviews/${id}`, payload);

export const deleteInterview = (id) => api.delete(`/interviews/${id}`);

// ─── Daily Tasks ─────────────────────────────
export const fetchDailyTasks = (profileId, date) =>
  api.get(`/daily-tasks/${profileId}`, { params: { date } });

export const createDailyTask = (payload) => api.post("/daily-tasks", payload);

export const toggleDailyTask = (id) => api.put(`/daily-tasks/${id}/toggle`);

export const updateDailyTask = (id, payload) =>
  api.put(`/daily-tasks/${id}`, payload);

export const deleteDailyTask = (id) => api.delete(`/daily-tasks/${id}`);

export default api;
