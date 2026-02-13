const supabase = require("../config/supabase");

// GET /api/daily-tasks/:profileId?date=YYYY-MM-DD
const getDailyTasks = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const date = req.query.date || new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_tasks")
      .select("*")
      .eq("profile_id", profileId)
      .eq("task_date", date)
      .order("created_at", { ascending: true });

    if (error) throw { statusCode: 400, message: error.message };

    const total = data.length;
    const completed = data.filter((t) => t.is_completed).length;
    const summary = { total, completed, pending: total - completed };

    res.json({ success: true, data, summary });
  } catch (err) {
    next(err);
  }
};

// POST /api/daily-tasks
const createDailyTask = async (req, res, next) => {
  try {
    const { profile_id, title, task_date, task_time, priority, category } =
      req.body;

    if (!profile_id || !title) {
      throw {
        statusCode: 400,
        message: "profile_id and title are required",
      };
    }

    const { data, error } = await supabase
      .from("daily_tasks")
      .insert({
        profile_id,
        title,
        task_date: task_date || new Date().toISOString().split("T")[0],
        task_time: task_time || null,
        priority: priority || "medium",
        category: category || "other",
      })
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/daily-tasks/:id/toggle
const toggleDailyTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch current task
    const { data: task, error: fetchError } = await supabase
      .from("daily_tasks")
      .select("is_completed")
      .eq("id", id)
      .single();

    if (fetchError) throw { statusCode: 404, message: "Task not found" };

    const { data, error } = await supabase
      .from("daily_tasks")
      .update({ is_completed: !task.is_completed })
      .eq("id", id)
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/daily-tasks/:id
const updateDailyTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, task_time, priority, category } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (task_time !== undefined) updates.task_time = task_time;
    if (priority !== undefined) updates.priority = priority;
    if (category !== undefined) updates.category = category;

    if (Object.keys(updates).length === 0) {
      throw { statusCode: 400, message: "No fields to update" };
    }

    const { data, error } = await supabase
      .from("daily_tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/daily-tasks/:id
const deleteDailyTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("daily_tasks").delete().eq("id", id);

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDailyTasks,
  createDailyTask,
  toggleDailyTask,
  updateDailyTask,
  deleteDailyTask,
};
