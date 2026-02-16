const { supabase } = require("../../config/supabase");

// GET /api/admin/users
const listUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20, sort = "created_at", order = "desc" } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from("profiles")
      .select("id, name, email, avatar_url, xp, level, app_streak, longest_app_streak, is_blocked, created_at", { count: "exact" });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    query = query.order(sort, { ascending: order === "asc" })
      .range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) throw { statusCode: 400, message: error.message };

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users/:id
const getUserDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !profile) throw { statusCode: 404, message: "User not found" };

    // Get counts
    const [habits, tasks, goals, transactions] = await Promise.all([
      supabase.from("habits").select("*", { count: "exact", head: true }).eq("profile_id", id),
      supabase.from("daily_tasks").select("*", { count: "exact", head: true }).eq("profile_id", id),
      supabase.from("goals").select("*", { count: "exact", head: true }).eq("profile_id", id),
      supabase.from("transactions").select("*", { count: "exact", head: true }).eq("profile_id", id),
    ]);

    res.json({
      success: true,
      data: {
        ...profile,
        counts: {
          habits: habits.count || 0,
          tasks: tasks.count || 0,
          goals: goals.count || 0,
          transactions: transactions.count || 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users/:id/habits
const getUserHabits = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("profile_id", req.params.id)
      .order("created_at", { ascending: false });

    if (error) throw { statusCode: 400, message: error.message };
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users/:id/tasks
const getUserTasks = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("daily_tasks")
      .select("*")
      .eq("profile_id", req.params.id)
      .order("task_date", { ascending: false })
      .limit(50);

    if (error) throw { statusCode: 400, message: error.message };
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users/:id/finance
const getUserFinance = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("profile_id", req.params.id)
      .order("transaction_date", { ascending: false })
      .limit(50);

    if (error) throw { statusCode: 400, message: error.message };
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users/:id/goals
const getUserGoals = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("profile_id", req.params.id)
      .order("created_at", { ascending: false });

    if (error) throw { statusCode: 400, message: error.message };
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id/block
const toggleBlock = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: profile, error: fetchErr } = await supabase
      .from("profiles")
      .select("is_blocked")
      .eq("id", id)
      .single();

    if (fetchErr || !profile) throw { statusCode: 404, message: "User not found" };

    const { error } = await supabase
      .from("profiles")
      .update({ is_blocked: !profile.is_blocked })
      .eq("id", id);

    if (error) throw { statusCode: 400, message: error.message };

    res.json({
      success: true,
      message: profile.is_blocked ? "User unblocked" : "User blocked",
      is_blocked: !profile.is_blocked,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Delete profile (cascades to all related data)
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listUsers,
  getUserDetail,
  getUserHabits,
  getUserTasks,
  getUserFinance,
  getUserGoals,
  toggleBlock,
  deleteUser,
};
