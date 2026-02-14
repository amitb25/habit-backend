import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as api from "../services/api";
import { useToast } from "./ToastContext";
import {
  requestNotificationPermissions,
  scheduleDailyReminder,
  cancelAllReminders,
} from "../services/notifications";

// Extract a clean string from any error
const getErrorMsg = (err, fallback) => {
  const msg = err?.response?.data?.message;
  if (typeof msg === "string") return msg;
  if (err?.message === "Network Error") return "Could not connect to server. Please check your internet or make sure the backend is running.";
  if (err?.code === "ECONNABORTED") return "Request timed out. Please try again.";
  return fallback;
};

const GlobalContext = createContext();

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobal must be used within GlobalProvider");
  return context;
};

const TAB_VISIBILITY_KEY = "@hustlekit_tab_visibility";
const DEFAULT_TAB_VISIBILITY = { finance: true, goals: true, workout: true, debts: true };

export const GlobalProvider = ({ children, user, onLogout }) => {
  const { showToast } = useToast();
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

  // Gamification state
  const [levelUpInfo, setLevelUpInfo] = useState(null);

  // ─── Tab Visibility ────────────────────────────
  const [tabVisibility, setTabVisibility] = useState(DEFAULT_TAB_VISIBILITY);

  const loadTabVisibility = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(TAB_VISIBILITY_KEY);
      if (stored) setTabVisibility({ ...DEFAULT_TAB_VISIBILITY, ...JSON.parse(stored) });
    } catch {}
  }, []);

  const toggleTabVisibility = useCallback(async (tabKey) => {
    setTabVisibility((prev) => {
      const updated = { ...prev, [tabKey]: !prev[tabKey] };
      AsyncStorage.setItem(TAB_VISIBILITY_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  useEffect(() => { loadTabVisibility(); }, []);

  // ─── Profile ──────────────────────────────────
  const loadProfile = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await api.fetchProfile(id);
      setProfile(res.data.data);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to load profile"));
    } finally {
      setLoading(false);
    }
  }, []);

  const saveManifestation = useCallback(async (id, text) => {
    try {
      const res = await api.updateManifestation(id, text);
      setProfile(res.data.data);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to update manifestation"));
    }
  }, []);

  const uploadAvatar = useCallback(async (id, base64Image) => {
    try {
      const res = await api.uploadAvatar(id, base64Image);
      setProfile(res.data.data);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to upload avatar. Max size is 5 MB."));
      throw err;
    }
  }, []);

  // ─── Habits ───────────────────────────────────
  const loadHabits = useCallback(async (profileId) => {
    try {
      setLoading(true);
      const res = await api.fetchHabits(profileId);
      setHabits(res.data.data);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to load habits"));
    } finally {
      setLoading(false);
    }
  }, []);

  const addHabit = useCallback(async (payload) => {
    try {
      const res = await api.createHabit(payload);
      setHabits((prev) => [...prev, res.data.data]);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to create habit"));
    }
  }, []);

  const toggleHabitStatus = useCallback(async (id) => {
    try {
      const res = await api.toggleHabit(id);
      const { data: habitData, action, leveled_up, level, xp, freeze_used, xp_change } = res.data;

      setHabits((prev) =>
        prev.map((h) => (h.id === id ? habitData : h))
      );

      // Detect level-up
      if (leveled_up && level) {
        setLevelUpInfo({ level });
      }

      // Reload profile to get updated XP, streak, freezes
      if (user?.id) {
        const profileRes = await api.fetchProfile(user.id);
        setProfile(profileRes.data.data);
      }

      return { action, freeze_used, xp_change };
    } catch (err) {
      setError(getErrorMsg(err, "Failed to toggle habit"));
      return null;
    }
  }, [user]);

  const removeHabit = useCallback(async (id) => {
    try {
      await api.deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to delete habit"));
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
      setError(getErrorMsg(err, "Failed to load debts"));
    } finally {
      setLoading(false);
    }
  }, []);

  const addDebt = useCallback(async (payload) => {
    try {
      const res = await api.createDebt(payload);
      setDebts((prev) => [...prev, res.data.data]);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to create debt"));
    }
  }, []);

  const payDebt = useCallback(
    async (id, payload, profileId) => {
      try {
        await api.recordPayment(id, payload);
        // Reload debts to get fresh summary
        await loadDebts(profileId);
      } catch (err) {
        setError(getErrorMsg(err, "Failed to record payment"));
      }
    },
    [loadDebts]
  );

  const removeDebt = useCallback(async (id) => {
    try {
      await api.deleteDebt(id);
      setDebts((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to delete debt"));
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
      setError(getErrorMsg(err, "Failed to load daily tasks"));
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
      setError(getErrorMsg(err, "Failed to create task"));
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
      setError(getErrorMsg(err, "Failed to toggle task"));
    }
  }, []);

  const editDailyTask = useCallback(async (id, updates) => {
    try {
      const res = await api.updateDailyTask(id, updates);
      setDailyTasks((prev) =>
        prev.map((t) => (t.id === id ? res.data.data : t))
      );
    } catch (err) {
      setError(getErrorMsg(err, "Failed to update task"));
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
      setError(getErrorMsg(err, "Failed to delete task"));
    }
  }, [dailyTasks]);

  // ─── Finance (Income/Expense) ───────────────
  const [transactions, setTransactions] = useState([]);
  const [financeSummary, setFinanceSummary] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0,
  });
  const [monthlyBudget, setMonthlyBudgetState] = useState(null);

  const loadTransactions = useCallback(async (profileId, month) => {
    try {
      const res = await api.fetchTransactions(profileId, month);
      setTransactions(res.data.data);
      setFinanceSummary(res.data.summary);

      // Also load budget for this month
      try {
        const summaryRes = await api.fetchMonthlySummary(profileId, month);
        setMonthlyBudgetState(summaryRes.data.data.budget);
      } catch {
        setMonthlyBudgetState(null);
      }
    } catch (err) {
      setError(getErrorMsg(err, "Failed to load transactions"));
    }
  }, []);

  const addTransaction = useCallback(async (payload) => {
    try {
      const res = await api.createTransaction(payload);
      setTransactions((prev) => [res.data.data, ...prev]);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to add transaction"));
    }
  }, []);

  const removeTransaction = useCallback(async (id) => {
    try {
      await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to delete transaction"));
    }
  }, []);

  const setMonthlyBudget = useCallback(async (profileId, month, amount) => {
    try {
      await api.setMonthlyBudget(profileId, month, amount);
      setMonthlyBudgetState(amount);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to set budget"));
    }
  }, []);

  // ─── Goals ─────────────────────────────────
  const [goals, setGoals] = useState([]);
  const [goalSummary, setGoalSummary] = useState({
    total: 0,
    active: 0,
    completed: 0,
    abandoned: 0,
  });
  const [goalMilestones, setGoalMilestones] = useState({});

  const loadGoals = useCallback(async (profileId) => {
    try {
      const res = await api.fetchGoals(profileId);
      setGoals(res.data.data);
      setGoalSummary(res.data.summary);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to load goals"));
    }
  }, []);

  const addGoal = useCallback(async (payload) => {
    try {
      const res = await api.createGoal(payload);
      setGoals((prev) => [res.data.data, ...prev]);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to create goal"));
    }
  }, []);

  const editGoal = useCallback(async (id, updates) => {
    try {
      const res = await api.updateGoal(id, updates);
      setGoals((prev) => prev.map((g) => (g.id === id ? res.data.data : g)));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to update goal"));
    }
  }, []);

  const updateGoalProgress = useCallback(async (id, value) => {
    try {
      const res = await api.updateGoalProgress(id, value);
      setGoals((prev) => prev.map((g) => (g.id === id ? res.data.data : g)));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to update progress"));
    }
  }, []);

  const removeGoal = useCallback(async (id) => {
    try {
      await api.deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to delete goal"));
    }
  }, []);

  const loadMilestones = useCallback(async (goalId) => {
    try {
      const res = await api.fetchMilestones(goalId);
      setGoalMilestones((prev) => ({ ...prev, [goalId]: res.data.data }));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to load milestones"));
    }
  }, []);

  const addGoalMilestone = useCallback(async (goalId, profileId, title) => {
    try {
      const res = await api.createMilestone(goalId, profileId, title);
      setGoalMilestones((prev) => ({
        ...prev,
        [goalId]: [...(prev[goalId] || []), res.data.data],
      }));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to add milestone"));
    }
  }, []);

  const toggleGoalMilestone = useCallback(async (milestoneId, goalId) => {
    try {
      const res = await api.toggleMilestone(milestoneId);
      setGoalMilestones((prev) => ({
        ...prev,
        [goalId]: (prev[goalId] || []).map((m) =>
          m.id === milestoneId ? res.data.data : m
        ),
      }));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to toggle milestone"));
    }
  }, []);

  const removeGoalMilestone = useCallback(async (milestoneId, goalId) => {
    try {
      await api.deleteMilestone(milestoneId);
      setGoalMilestones((prev) => ({
        ...prev,
        [goalId]: (prev[goalId] || []).filter((m) => m.id !== milestoneId),
      }));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to delete milestone"));
    }
  }, []);

  // ─── Custom Affirmations ────────────────────
  const [customAffirmations, setCustomAffirmations] = useState([]);

  const loadCustomAffirmations = useCallback(async (profileId) => {
    try {
      const res = await api.fetchCustomAffirmations(profileId);
      setCustomAffirmations(res.data.data);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to load affirmations"));
    }
  }, []);

  const addCustomAffirmation = useCallback(async (payload) => {
    try {
      const res = await api.createCustomAffirmation(payload);
      setCustomAffirmations((prev) => [res.data.data, ...prev]);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to add affirmation"));
    }
  }, []);

  const toggleAffirmationFav = useCallback(async (id) => {
    try {
      const res = await api.toggleAffirmationFavorite(id);
      setCustomAffirmations((prev) =>
        prev.map((a) => (a.id === id ? res.data.data : a))
      );
    } catch (err) {
      setError(getErrorMsg(err, "Failed to toggle favorite"));
    }
  }, []);

  const removeCustomAffirmation = useCallback(async (id) => {
    try {
      await api.deleteCustomAffirmation(id);
      setCustomAffirmations((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(getErrorMsg(err, "Failed to delete affirmation"));
    }
  }, []);

  // ─── Notifications ──────────────────────────
  const updateNotificationSettings = useCallback(async (id, enabled, time) => {
    try {
      await api.updateProfile(id, {
        notifications_enabled: enabled,
        reminder_time: time,
      });

      if (enabled && time) {
        const [hour, minute] = time.split(":").map(Number);
        await requestNotificationPermissions();
        await scheduleDailyReminder(hour, minute);
      } else {
        await cancelAllReminders();
      }

      // Reload profile
      const res = await api.fetchProfile(id);
      setProfile(res.data.data);
    } catch (err) {
      setError(getErrorMsg(err, "Failed to update notification settings"));
    }
  }, []);

  const dismissLevelUp = useCallback(() => setLevelUpInfo(null), []);

  // Initialize notifications when profile loads
  useEffect(() => {
    if (profile?.notifications_enabled && profile?.reminder_time) {
      const [hour, minute] = profile.reminder_time.split(":").map(Number);
      requestNotificationPermissions()
        .then((granted) => {
          if (granted) scheduleDailyReminder(hour, minute);
        })
        .catch(() => {});
    }
  }, [profile?.id]);

  // Grant weekly freeze on app startup
  useEffect(() => {
    if (user?.id) {
      api.grantWeeklyFreeze(user.id).catch(() => {});
    }
  }, [user?.id]);

  // Show error as toast whenever it changes
  useEffect(() => {
    if (error) {
      showToast(error, "error");
      setError(null);
    }
  }, [error]);

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
    loading,
    error,

    // Gamification
    levelUpInfo,
    dismissLevelUp,

    // Tab visibility
    tabVisibility,
    toggleTabVisibility,

    // Profile actions
    loadProfile,
    saveManifestation,
    uploadAvatar,
    updateNotificationSettings,

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

    // Finance actions
    transactions,
    financeSummary,
    monthlyBudget,
    loadTransactions,
    addTransaction,
    removeTransaction,
    setMonthlyBudget,

    // Goal actions
    goals,
    goalSummary,
    goalMilestones,
    loadGoals,
    addGoal,
    editGoal,
    updateGoalProgress,
    removeGoal,
    loadMilestones,
    addGoalMilestone,
    toggleGoalMilestone,
    removeGoalMilestone,

    // Custom Affirmation actions
    customAffirmations,
    loadCustomAffirmations,
    addCustomAffirmation,
    toggleAffirmationFav,
    removeCustomAffirmation,

    // Utility
    clearError,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

export default GlobalContext;
