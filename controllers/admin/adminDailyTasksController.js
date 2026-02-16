const { supabase } = require("../../config/supabase");

// GET /api/admin/daily-tasks
const listDailyTasks = async (req, res, next) => {
  try {
    const { date, page = 1, limit = 30 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from("daily_tasks")
      .select("*, profiles(name, email)", { count: "exact" });

    if (date) query = query.eq("task_date", date);

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

module.exports = { listDailyTasks };
