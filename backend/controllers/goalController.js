const { supabase } = require("../config/supabase");

// GET /api/goals/:profileId
const getGoals = async (req, res, next) => {
  try {
    const { profileId } = req.params;

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("profile_id", profileId)
      .order("status", { ascending: true })
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw { statusCode: 400, message: error.message };

    // Calculate summary
    const summary = {
      total: data.length,
      active: data.filter((g) => g.status === "active").length,
      completed: data.filter((g) => g.status === "completed").length,
      abandoned: data.filter((g) => g.status === "abandoned").length,
    };

    res.json({ success: true, data, summary });
  } catch (err) {
    next(err);
  }
};

// POST /api/goals
const createGoal = async (req, res, next) => {
  try {
    const {
      profile_id,
      title,
      description,
      category,
      target_value,
      unit,
      deadline,
      priority,
    } = req.body;

    if (!profile_id || !title || !category) {
      throw {
        statusCode: 400,
        message: "profile_id, title, and category are required",
      };
    }

    const { data, error } = await supabase
      .from("goals")
      .insert({
        profile_id,
        title,
        description: description || null,
        category,
        target_value: target_value || null,
        current_value: 0,
        unit: unit || null,
        deadline: deadline || null,
        priority: priority || "medium",
      })
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/goals/:id
const updateGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("goals")
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

// PUT /api/goals/:id/progress — Update current_value
const updateProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value } = req.body;

    if (value === undefined || value === null) {
      throw { statusCode: 400, message: "value is required" };
    }

    // Fetch goal
    const { data: goal, error: fetchError } = await supabase
      .from("goals")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw { statusCode: 404, message: "Goal not found" };

    const newValue = Number(value);
    const updates = { current_value: newValue };

    // Auto-complete if target reached
    if (goal.target_value && newValue >= Number(goal.target_value)) {
      updates.status = "completed";
    }

    const { data, error } = await supabase
      .from("goals")
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

// DELETE /api/goals/:id
const deleteGoal = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, message: "Goal deleted" });
  } catch (err) {
    next(err);
  }
};

// ─── Milestones ────────────────────────────

// GET /api/goals/:id/milestones
const getMilestones = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("milestones")
      .select("*")
      .eq("goal_id", id)
      .order("created_at", { ascending: true });

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/goals/:id/milestones
const addMilestone = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, profile_id } = req.body;

    if (!title) {
      throw { statusCode: 400, message: "title is required" };
    }

    const { data, error } = await supabase
      .from("milestones")
      .insert({ goal_id: id, profile_id, title })
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/goals/milestones/:milestoneId/toggle
const toggleMilestone = async (req, res, next) => {
  try {
    const { milestoneId } = req.params;

    // Fetch current state
    const { data: milestone, error: fetchErr } = await supabase
      .from("milestones")
      .select("*")
      .eq("id", milestoneId)
      .single();

    if (fetchErr) throw { statusCode: 404, message: "Milestone not found" };

    const newCompleted = !milestone.is_completed;

    const { data, error } = await supabase
      .from("milestones")
      .update({
        is_completed: newCompleted,
        completed_date: newCompleted ? new Date().toISOString().split("T")[0] : null,
      })
      .eq("id", milestoneId)
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/goals/milestones/:milestoneId
const deleteMilestone = async (req, res, next) => {
  try {
    const { milestoneId } = req.params;

    const { error } = await supabase.from("milestones").delete().eq("id", milestoneId);
    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, message: "Milestone deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  updateProgress,
  deleteGoal,
  getMilestones,
  addMilestone,
  toggleMilestone,
  deleteMilestone,
};
