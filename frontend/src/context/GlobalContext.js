// ─── Backward-compatible facade ─────────────────────────
// All domain logic has been split into src/context/domains/
// This file merges all domain hooks into a single useGlobal() hook
// so existing screens continue working without import changes.
//
// Migrate screens to use domain-specific hooks (useHabits, useDebts, etc.)
// for better performance, then remove this facade.

import { useAuth } from "./domains/AuthContext";
import { useProfile } from "./domains/ProfileContext";
import { useHabits } from "./domains/HabitsContext";
import { useDebts } from "./domains/DebtsContext";
import { useDailyTasks } from "./domains/DailyTasksContext";
import { useFinance } from "./domains/FinanceContext";
import { useGoals } from "./domains/GoalsContext";
import { useAffirmations } from "./domains/AffirmationsContext";
import { useTabVisibility } from "./domains/TabVisibilityContext";
import { useWater } from "./domains/WaterContext";
import { useSleep } from "./domains/SleepContext";

export const useGlobal = () => {
  const auth = useAuth();
  const profile = useProfile();
  const habits = useHabits();
  const debts = useDebts();
  const dailyTasks = useDailyTasks();
  const finance = useFinance();
  const goals = useGoals();
  const affirmations = useAffirmations();
  const tabVis = useTabVisibility();
  const water = useWater();
  const sleep = useSleep();

  return {
    // Auth
    user: auth.user,
    onLogout: auth.onLogout,
    loading: auth.loading,
    error: auth.error,
    clearError: auth.clearError,

    // Profile
    profile: profile.profile,
    loadProfile: profile.loadProfile,
    saveManifestation: profile.saveManifestation,
    uploadAvatar: profile.uploadAvatar,
    updateNotificationSettings: profile.updateNotificationSettings,
    levelUpInfo: profile.levelUpInfo,
    dismissLevelUp: profile.dismissLevelUp,

    // Habits
    habits: habits.habits,
    loadHabits: habits.loadHabits,
    addHabit: habits.addHabit,
    toggleHabitStatus: habits.toggleHabitStatus,
    removeHabit: habits.removeHabit,

    // Debts
    debts: debts.debts,
    debtSummary: debts.debtSummary,
    loadDebts: debts.loadDebts,
    addDebt: debts.addDebt,
    payDebt: debts.payDebt,
    removeDebt: debts.removeDebt,

    // Daily Tasks
    dailyTasks: dailyTasks.dailyTasks,
    dailyTaskSummary: dailyTasks.dailyTaskSummary,
    loadDailyTasks: dailyTasks.loadDailyTasks,
    addDailyTask: dailyTasks.addDailyTask,
    toggleDailyTaskStatus: dailyTasks.toggleDailyTaskStatus,
    editDailyTask: dailyTasks.editDailyTask,
    removeDailyTask: dailyTasks.removeDailyTask,

    // Finance
    transactions: finance.transactions,
    financeSummary: finance.financeSummary,
    monthlyBudget: finance.monthlyBudget,
    loadTransactions: finance.loadTransactions,
    addTransaction: finance.addTransaction,
    removeTransaction: finance.removeTransaction,
    setMonthlyBudget: finance.setMonthlyBudget,

    // Goals
    goals: goals.goals,
    goalSummary: goals.goalSummary,
    goalMilestones: goals.goalMilestones,
    loadGoals: goals.loadGoals,
    addGoal: goals.addGoal,
    editGoal: goals.editGoal,
    updateGoalProgress: goals.updateGoalProgress,
    removeGoal: goals.removeGoal,
    loadMilestones: goals.loadMilestones,
    addGoalMilestone: goals.addGoalMilestone,
    toggleGoalMilestone: goals.toggleGoalMilestone,
    removeGoalMilestone: goals.removeGoalMilestone,

    // Affirmations
    customAffirmations: affirmations.customAffirmations,
    loadCustomAffirmations: affirmations.loadCustomAffirmations,
    addCustomAffirmation: affirmations.addCustomAffirmation,
    toggleAffirmationFav: affirmations.toggleAffirmationFav,
    removeCustomAffirmation: affirmations.removeCustomAffirmation,

    // Water
    todayWater: water.todayWater,
    loadWater: water.loadWater,
    addGlass: water.addGlass,
    removeGlass: water.removeGlass,

    // Sleep
    sleepLogs: sleep.sleepLogs,
    sleepSummary: sleep.sleepSummary,
    loadSleep: sleep.loadSleep,
    addSleepLog: sleep.addSleepLog,
    removeSleepLog: sleep.removeSleepLog,

    // Tab Visibility
    tabVisibility: tabVis.tabVisibility,
    toggleTabVisibility: tabVis.toggleTabVisibility,
  };
};
