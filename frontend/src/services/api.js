import axios from "axios";

// __DEV__ = true in Expo dev, false in APK/production
const LOCAL = "http://192.168.31.69:5000/api";
const LIVE = "https://habit-backend-omega.vercel.app/api";
const API_BASE = __DEV__ ? LOCAL : LIVE;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ─── Auth ────────────────────────────────────────────
export const loginUser = (payload) => api.post("/auth/login", payload);
export const signupUser = (payload) => api.post("/auth/signup", payload);

export const changePassword = (email, currentPassword, newPassword) =>
  api.post("/auth/change-password", { email, currentPassword, newPassword });

export const googleLogin = (idToken) => api.post("/auth/google", { idToken });

// ─── Profile ──────────────────────────────────────
export const fetchProfile = (id) => api.get(`/profiles/${id}`);

export const createProfile = (payload) => api.post("/profiles", payload);

export const updateProfile = (id, payload) =>
  api.put(`/profiles/${id}`, payload);

export const updateManifestation = (id, manifestation) =>
  api.put(`/profiles/${id}/manifestation`, { manifestation });

export const uploadAvatar = (id, base64Image) =>
  api.put(`/profiles/${id}/avatar`, { base64Image }, { timeout: 30000 });

export const grantWeeklyFreeze = (profileId) =>
  api.post(`/profiles/${profileId}/grant-weekly-freeze`);

export const fetchXPHistory = (profileId) =>
  api.get(`/profiles/${profileId}/xp-history`);

export const clearAllUserData = (profileId) =>
  api.delete(`/profiles/${profileId}/data`);

export const deleteAccount = (profileId, email) =>
  api.delete(`/profiles/${profileId}/account`, { data: { email } });

// ─── Habits ───────────────────────────────────────
export const fetchHabits = (profileId) => api.get(`/habits/${profileId}`);

export const createHabit = (payload) => api.post("/habits", payload);

export const toggleHabit = (id) => api.put(`/habits/${id}/toggle`);

export const deleteHabit = (id) => api.delete(`/habits/${id}`);

export const fetchHabitLogs = (id) => api.get(`/habits/${id}/logs`);

export const fetchHabitAnalytics = (profileId) =>
  api.get(`/habits/analytics/${profileId}`);

// ─── Debts ────────────────────────────────────────
export const fetchDebts = (profileId) => api.get(`/debts/${profileId}`);

export const createDebt = (payload) => api.post("/debts", payload);

export const recordPayment = (id, payload) =>
  api.post(`/debts/${id}/pay`, payload);

export const fetchPayments = (id) => api.get(`/debts/${id}/payments`);

export const deleteDebt = (id) => api.delete(`/debts/${id}`);

// ─── Daily Tasks ─────────────────────────────
export const fetchDailyTasks = (profileId, date) =>
  api.get(`/daily-tasks/${profileId}`, { params: { date } });

export const createDailyTask = (payload) => api.post("/daily-tasks", payload);

export const toggleDailyTask = (id) => api.put(`/daily-tasks/${id}/toggle`);

export const updateDailyTask = (id, payload) =>
  api.put(`/daily-tasks/${id}`, payload);

export const deleteDailyTask = (id) => api.delete(`/daily-tasks/${id}`);

// ─── Finance (Income/Expense) ─────────────────
export const fetchTransactions = (profileId, month) =>
  api.get(`/finance/${profileId}`, { params: { month } });

export const createTransaction = (payload) => api.post("/finance", payload);

export const updateTransaction = (id, payload) => api.put(`/finance/${id}`, payload);

export const deleteTransaction = (id) => api.delete(`/finance/${id}`);

export const fetchMonthlySummary = (profileId, month) =>
  api.get(`/finance/${profileId}/summary`, { params: { month } });

export const setMonthlyBudget = (profileId, month, budget_amount) =>
  api.post(`/finance/${profileId}/budget`, { month, budget_amount });

// ─── Goals ────────────────────────────────────
export const fetchGoals = (profileId) => api.get(`/goals/${profileId}`);

export const createGoal = (payload) => api.post("/goals", payload);

export const updateGoal = (id, payload) => api.put(`/goals/${id}`, payload);

export const updateGoalProgress = (id, value) =>
  api.put(`/goals/${id}/progress`, { value });

export const deleteGoal = (id) => api.delete(`/goals/${id}`);

export const fetchMilestones = (goalId) => api.get(`/goals/${goalId}/milestones`);

export const createMilestone = (goalId, profile_id, title) =>
  api.post(`/goals/${goalId}/milestones`, { profile_id, title });

export const toggleMilestone = (milestoneId) =>
  api.put(`/goals/milestones/${milestoneId}/toggle`);

export const deleteMilestone = (milestoneId) =>
  api.delete(`/goals/milestones/${milestoneId}`);

// ─── Custom Affirmations ─────────────────────
export const fetchCustomAffirmations = (profileId) =>
  api.get(`/affirmations/${profileId}`);

export const createCustomAffirmation = (payload) =>
  api.post("/affirmations", payload);

export const toggleAffirmationFavorite = (id) =>
  api.put(`/affirmations/${id}/favorite`);

export const deleteCustomAffirmation = (id) =>
  api.delete(`/affirmations/${id}`);

export default api;
