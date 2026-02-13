import React, { createContext, useContext, useState, useCallback } from "react";
import * as api from "../services/api";

const GlobalContext = createContext();

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobal must be used within GlobalProvider");
  return context;
};

export const GlobalProvider = ({ children, user, onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [habits, setHabits] = useState([]);
  const [debts, setDebts] = useState([]);
  const [debtSummary, setDebtSummary] = useState({
    total_debt: 0,
    total_paid: 0,
    total_remaining: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─── Profile ──────────────────────────────────
  const loadProfile = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await api.fetchProfile(id);
      setProfile(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveManifestation = useCallback(async (id, text) => {
    try {
      const res = await api.updateManifestation(id, text);
      setProfile(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update manifestation");
    }
  }, []);

  const uploadAvatar = useCallback(async (id, base64Image) => {
    try {
      const res = await api.uploadAvatar(id, base64Image);
      setProfile(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload avatar");
    }
  }, []);

  // ─── Habits ───────────────────────────────────
  const loadHabits = useCallback(async (profileId) => {
    try {
      setLoading(true);
      const res = await api.fetchHabits(profileId);
      setHabits(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load habits");
    } finally {
      setLoading(false);
    }
  }, []);

  const addHabit = useCallback(async (payload) => {
    try {
      const res = await api.createHabit(payload);
      setHabits((prev) => [...prev, res.data.data]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create habit");
    }
  }, []);

  const toggleHabitStatus = useCallback(async (id) => {
    try {
      const res = await api.toggleHabit(id);
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? res.data.data : h))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to toggle habit");
    }
  }, []);

  const removeHabit = useCallback(async (id) => {
    try {
      await api.deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete habit");
    }
  }, []);

  // ─── Debts ────────────────────────────────────
  const loadDebts = useCallback(async (profileId) => {
    try {
      setLoading(true);
      const res = await api.fetchDebts(profileId);
      setDebts(res.data.data);
      setDebtSummary(res.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load debts");
    } finally {
      setLoading(false);
    }
  }, []);

  const addDebt = useCallback(async (payload) => {
    try {
      const res = await api.createDebt(payload);
      setDebts((prev) => [...prev, res.data.data]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create debt");
    }
  }, []);

  const payDebt = useCallback(
    async (id, payload, profileId) => {
      try {
        await api.recordPayment(id, payload);
        // Reload debts to get fresh summary
        await loadDebts(profileId);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to record payment");
      }
    },
    [loadDebts]
  );

  const removeDebt = useCallback(async (id) => {
    try {
      await api.deleteDebt(id);
      setDebts((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete debt");
    }
  }, []);

  // ─── Daily Tasks ────────────────────────────
  const [dailyTasks, setDailyTasks] = useState([]);
  const [dailyTaskSummary, setDailyTaskSummary] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  const loadDailyTasks = useCallback(async (profileId, date) => {
    try {
      const res = await api.fetchDailyTasks(profileId, date);
      setDailyTasks(res.data.data);
      setDailyTaskSummary(res.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load daily tasks");
    }
  }, []);

  const addDailyTask = useCallback(async (payload) => {
    try {
      const res = await api.createDailyTask(payload);
      setDailyTasks((prev) => [...prev, res.data.data]);
      setDailyTaskSummary((prev) => ({
        total: prev.total + 1,
        completed: prev.completed,
        pending: prev.pending + 1,
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    }
  }, []);

  const toggleDailyTaskStatus = useCallback(async (id) => {
    try {
      const res = await api.toggleDailyTask(id);
      setDailyTasks((prev) =>
        prev.map((t) => (t.id === id ? res.data.data : t))
      );
      const wasCompleted = !res.data.data.is_completed;
      setDailyTaskSummary((prev) => ({
        total: prev.total,
        completed: prev.completed + (wasCompleted ? -1 : 1),
        pending: prev.pending + (wasCompleted ? 1 : -1),
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to toggle task");
    }
  }, []);

  const editDailyTask = useCallback(async (id, updates) => {
    try {
      const res = await api.updateDailyTask(id, updates);
      setDailyTasks((prev) =>
        prev.map((t) => (t.id === id ? res.data.data : t))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    }
  }, []);

  const removeDailyTask = useCallback(async (id) => {
    try {
      const task = dailyTasks.find((t) => t.id === id);
      await api.deleteDailyTask(id);
      setDailyTasks((prev) => prev.filter((t) => t.id !== id));
      setDailyTaskSummary((prev) => ({
        total: prev.total - 1,
        completed: prev.completed - (task?.is_completed ? 1 : 0),
        pending: prev.pending - (task?.is_completed ? 0 : 1),
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task");
    }
  }, [dailyTasks]);

  // ─── Interviews ──────────────────────────────
  const [interviews, setInterviews] = useState([]);
  const [interviewSummary, setInterviewSummary] = useState({
    total: 0, applied: 0, in_progress: 0, offers: 0, rejected: 0, ghosted: 0,
  });

  const loadInterviews = useCallback(async (profileId) => {
    try {
      setLoading(true);
      const res = await api.fetchInterviews(profileId);
      setInterviews(res.data.data);
      setInterviewSummary(res.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load interviews");
    } finally {
      setLoading(false);
    }
  }, []);

  const addInterview = useCallback(async (payload) => {
    try {
      const res = await api.createInterview(payload);
      setInterviews((prev) => [res.data.data, ...prev]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create interview");
    }
  }, []);

  const editInterview = useCallback(async (id, updates) => {
    try {
      const res = await api.updateInterview(id, updates);
      setInterviews((prev) =>
        prev.map((i) => (i.id === id ? res.data.data : i))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update interview");
    }
  }, []);

  const removeInterview = useCallback(async (id) => {
    try {
      await api.deleteInterview(id);
      setInterviews((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete interview");
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    // User (logged-in)
    user,
    onLogout,
    // State
    profile,
    habits,
    debts,
    debtSummary,
    dailyTasks,
    dailyTaskSummary,
    interviews,
    interviewSummary,
    loading,
    error,

    // Profile actions
    loadProfile,
    saveManifestation,
    uploadAvatar,

    // Habit actions
    loadHabits,
    addHabit,
    toggleHabitStatus,
    removeHabit,

    // Debt actions
    loadDebts,
    addDebt,
    payDebt,
    removeDebt,

    // Daily Task actions
    loadDailyTasks,
    addDailyTask,
    toggleDailyTaskStatus,
    editDailyTask,
    removeDailyTask,

    // Interview actions
    loadInterviews,
    addInterview,
    editInterview,
    removeInterview,

    // Utility
    clearError,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

export default GlobalContext;
