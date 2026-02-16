const express = require("express");
const router = express.Router();
const { adminAuth, requireRole } = require("../middleware/adminAuth");

// Controllers
const { login, getMe, changePassword } = require("../controllers/admin/adminAuthController");
const { getStats, getUserGrowth, getLevelDistribution } = require("../controllers/admin/adminDashboardController");
const { listUsers, getUserDetail, getUserHabits, getUserTasks, getUserFinance, getUserGoals, toggleBlock, deleteUser } = require("../controllers/admin/adminUsersController");
const { listCategories, createCategory, updateCategory, deleteCategory, listExercises, createExercise, updateExercise, deleteExercise } = require("../controllers/admin/adminExercisesController");
const { listWorkouts, createWorkout, updateWorkout, deleteWorkout } = require("../controllers/admin/adminWorkoutsController");
const { listHabits, getHabitStats } = require("../controllers/admin/adminHabitsController");
const { listDailyTasks } = require("../controllers/admin/adminDailyTasksController");
const { getFinanceOverview, listTransactions } = require("../controllers/admin/adminFinanceController");
const { listGoals, getGoalStats } = require("../controllers/admin/adminGoalsController");
const { listInterviews, getInterviewStats } = require("../controllers/admin/adminInterviewsController");
const { listAffirmations, deleteAffirmation } = require("../controllers/admin/adminAffirmationsController");
const { getSettings, updateSettings } = require("../controllers/admin/adminSettingsController");

// ─── Auth (public) ───────────────────────────────────────────────────
router.post("/auth/login", login);

// ─── All routes below require admin auth ─────────────────────────────
router.use(adminAuth);

// Auth (protected)
router.get("/auth/me", getMe);
router.post("/auth/change-password", changePassword);

// Dashboard
router.get("/dashboard/stats", getStats);
router.get("/dashboard/user-growth", getUserGrowth);
router.get("/dashboard/level-distribution", getLevelDistribution);

// Users
router.get("/users", listUsers);
router.get("/users/:id", getUserDetail);
router.get("/users/:id/habits", getUserHabits);
router.get("/users/:id/tasks", getUserTasks);
router.get("/users/:id/finance", getUserFinance);
router.get("/users/:id/goals", getUserGoals);
router.put("/users/:id/block", toggleBlock);
router.delete("/users/:id", requireRole("super_admin", "admin"), deleteUser);

// Exercise categories
router.get("/exercises/categories", listCategories);
router.post("/exercises/categories", createCategory);
router.put("/exercises/categories/:id", updateCategory);
router.delete("/exercises/categories/:id", deleteCategory);

// Exercises
router.get("/exercises", listExercises);
router.post("/exercises", createExercise);
router.put("/exercises/:id", updateExercise);
router.delete("/exercises/:id", deleteExercise);

// Workouts
router.get("/workouts", listWorkouts);
router.post("/workouts", createWorkout);
router.put("/workouts/:id", updateWorkout);
router.delete("/workouts/:id", deleteWorkout);

// Habits
router.get("/habits", listHabits);
router.get("/habits/stats", getHabitStats);

// Daily Tasks
router.get("/daily-tasks", listDailyTasks);

// Finance
router.get("/finance/overview", getFinanceOverview);
router.get("/finance/transactions", listTransactions);

// Goals
router.get("/goals", listGoals);
router.get("/goals/stats", getGoalStats);

// Interviews
router.get("/interviews", listInterviews);
router.get("/interviews/stats", getInterviewStats);

// Affirmations
router.get("/affirmations", listAffirmations);
router.delete("/affirmations/:id", deleteAffirmation);

// Settings
router.get("/settings", getSettings);
router.put("/settings", requireRole("super_admin", "admin"), updateSettings);

module.exports = router;
