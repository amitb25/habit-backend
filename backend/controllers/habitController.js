const supabase = require("../config/supabase");

// Helper: Get today's date in YYYY-MM-DD
const getToday = () => new Date().toISOString().split("T")[0];

// Helper: Get yesterday's date in YYYY-MM-DD
const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};

// GET /api/habits/:profileId
const getHabits = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const today = getToday();

    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: true });

    if (error) throw { statusCode: 400, message: error.message };

    // Mark is_completed_today based on last_completed_date
    const habits = data.map((habit) => ({
      ...habit,
      is_completed_today: habit.last_completed_date === today,
    }));

    res.json({ success: true, data: habits });
  } catch (err) {
    next(err);
  }
};

// POST /api/habits
const createHabit = async (req, res, next) => {
  try {
    const { profile_id, title, category } = req.body;

    if (!profile_id || !title || !category) {
      throw {
        statusCode: 400,
        message: "profile_id, title, and category are required",
      };
    }

    const { data, error } = await supabase
      .from("habits")
      .insert({ profile_id, title, category })
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/habits/:id/toggle — Mark habit as done/undone for today
const toggleHabit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const today = getToday();
    const yesterday = getYesterday();

    // Fetch current habit
    const { data: habit, error: fetchError } = await supabase
      .from("habits")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw { statusCode: 404, message: "Habit not found" };

    const alreadyDoneToday = habit.last_completed_date === today;

    if (alreadyDoneToday) {
      // UNDO: Remove today's log, decrement streak
      await supabase
        .from("habit_logs")
        .delete()
        .eq("habit_id", id)
        .eq("completed_date", today);

      const newStreak = Math.max(0, habit.current_streak - 1);

      const { data, error } = await supabase
        .from("habits")
        .update({
          is_completed_today: false,
          current_streak: newStreak,
          last_completed_date: yesterday,
          total_completions: Math.max(0, habit.total_completions - 1),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw { statusCode: 400, message: error.message };

      return res.json({ success: true, data, action: "unmarked" });
    }

    // MARK COMPLETE: Insert log + update streak
    const { error: logError } = await supabase
      .from("habit_logs")
      .insert({ habit_id: id, profile_id: habit.profile_id, completed_date: today });

    if (logError && logError.code !== "23505") {
      // 23505 = unique violation (already logged, ignore)
      throw { statusCode: 400, message: logError.message };
    }

    // Calculate streak: if last completed was yesterday, continue streak; else reset to 1
    const wasYesterday = habit.last_completed_date === yesterday;
    const newStreak = wasYesterday ? habit.current_streak + 1 : 1;
    const longestStreak = Math.max(habit.longest_streak, newStreak);

    const { data, error } = await supabase
      .from("habits")
      .update({
        is_completed_today: true,
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_completed_date: today,
        total_completions: habit.total_completions + 1,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, data, action: "marked" });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/habits/:id
const deleteHabit = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("habits").delete().eq("id", id);

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, message: "Habit deleted" });
  } catch (err) {
    next(err);
  }
};

// GET /api/habits/:id/logs — Get completion history
const getHabitLogs = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("habit_id", id)
      .order("completed_date", { ascending: false })
      .limit(30);

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getHabits,
  createHabit,
  toggleHabit,
  deleteHabit,
  getHabitLogs,
};
