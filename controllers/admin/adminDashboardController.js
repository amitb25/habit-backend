const { supabase } = require("../../config/supabase");

// GET /api/admin/dashboard/stats
const getStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Total users
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // New users this week
    const { count: newUsersWeek } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo);

    // Active users today
    const { count: activeToday } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("last_active_date", today);

    // Total habits
    const { count: totalHabits } = await supabase
      .from("habits")
      .select("*", { count: "exact", head: true });

    // Habits completed today
    const { count: habitsCompletedToday } = await supabase
      .from("habit_logs")
      .select("*", { count: "exact", head: true })
      .eq("completed_date", today);

    // Total exercises in DB
    const { count: totalExercises } = await supabase
      .from("exercises")
      .select("*", { count: "exact", head: true });

    // Total goals
    const { count: totalGoals } = await supabase
      .from("goals")
      .select("*", { count: "exact", head: true });

    // Blocked users
    const { count: blockedUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_blocked", true);

    res.json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        newUsersWeek: newUsersWeek || 0,
        activeToday: activeToday || 0,
        totalHabits: totalHabits || 0,
        habitsCompletedToday: habitsCompletedToday || 0,
        totalExercises: totalExercises || 0,
        totalGoals: totalGoals || 0,
        blockedUsers: blockedUsers || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/dashboard/user-growth
const getUserGrowth = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data: users, error } = await supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", startDate)
      .order("created_at", { ascending: true });

    if (error) throw { statusCode: 400, message: error.message };

    // Group by date
    const grouped = {};
    users.forEach((u) => {
      const date = u.created_at.split("T")[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });

    const data = Object.entries(grouped).map(([date, count]) => ({ date, count }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/dashboard/level-distribution
const getLevelDistribution = async (req, res, next) => {
  try {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("level");

    if (error) throw { statusCode: 400, message: error.message };

    const distribution = {};
    profiles.forEach((p) => {
      const lvl = p.level || 1;
      const range = lvl <= 5 ? "1-5" : lvl <= 10 ? "6-10" : lvl <= 20 ? "11-20" : "21+";
      distribution[range] = (distribution[range] || 0) + 1;
    });

    const data = Object.entries(distribution).map(([range, count]) => ({ range, count }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getUserGrowth, getLevelDistribution };
