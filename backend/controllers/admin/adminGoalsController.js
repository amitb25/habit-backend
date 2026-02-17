const { supabase } = require("../../config/supabase");

// GET /api/admin/goals
const listGoals = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 30 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from("goals")
      .select("*, profiles(name, email)", { count: "exact" });

    if (search) query = query.or(`title.ilike.%${search}%,category.ilike.%${search}%`);
    if (status) query = query.eq("status", status);

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

// GET /api/admin/goals/stats
const getGoalStats = async (req, res, next) => {
  try {
    const { data: goals, error } = await supabase
      .from("goals")
      .select("status, category, priority");

    if (error) throw { statusCode: 400, message: error.message };

    const statusBreakdown = {};
    const categoryBreakdown = {};

    goals.forEach((g) => {
      statusBreakdown[g.status] = (statusBreakdown[g.status] || 0) + 1;
      categoryBreakdown[g.category] = (categoryBreakdown[g.category] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        total: goals.length,
        byStatus: Object.entries(statusBreakdown).map(([status, count]) => ({ status, count })),
        byCategory: Object.entries(categoryBreakdown).map(([category, count]) => ({ category, count })),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listGoals, getGoalStats };
