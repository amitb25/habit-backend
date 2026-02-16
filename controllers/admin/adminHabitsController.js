const { supabase } = require("../../config/supabase");

// GET /api/admin/habits
const listHabits = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 30 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from("habits")
      .select("*, profiles(name, email)", { count: "exact" });

    if (search) query = query.ilike("title", `%${search}%`);

    query = query.order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;
    if (error) throw { statusCode: 400, message: error.message };

    res.json({
      success: true,
      data,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: count || 0, pages: Math.ceil((count || 0) / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/habits/stats
const getHabitStats = async (req, res, next) => {
  try {
    const { data: habits, error } = await supabase
      .from("habits")
      .select("category, is_completed_today, current_streak");

    if (error) throw { statusCode: 400, message: error.message };

    const categoryBreakdown = {};
    let completedToday = 0;
    let totalStreak = 0;

    habits.forEach((h) => {
      categoryBreakdown[h.category] = (categoryBreakdown[h.category] || 0) + 1;
      if (h.is_completed_today) completedToday++;
      totalStreak += h.current_streak || 0;
    });

    res.json({
      success: true,
      data: {
        total: habits.length,
        completedToday,
        avgStreak: habits.length ? Math.round(totalStreak / habits.length) : 0,
        categoryBreakdown: Object.entries(categoryBreakdown).map(([category, count]) => ({ category, count })),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listHabits, getHabitStats };
