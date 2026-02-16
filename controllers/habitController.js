const { supabase } = require("../config/supabase");

// Helper: Get today's date in YYYY-MM-DD
const getToday = () => new Date().toISOString().split("T")[0];

// Helper: Get yesterday's date in YYYY-MM-DD
const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};

// ─── Gamification Helpers ──────────────────────────────

// Upsert daily_checkins + update app_streak on profile
const updateAppStreak = async (profileId) => {
  const today = getToday();
  const yesterday = getYesterday();

  // Upsert daily checkin
  const { data: habits } = await supabase
    .from("habits")
    .select("is_completed_today")
    .eq("profile_id", profileId);

  const habitsCompleted = (habits || []).filter((h) => h.is_completed_today).length;

  await supabase.from("daily_checkins").upsert(
    { profile_id: profileId, checkin_date: today, habits_completed: habitsCompleted },
    { onConflict: "profile_id,checkin_date" }
  );

  // Get profile for streak calc
  const { data: profile } = await supabase
    .from("profiles")
    .select("app_streak, longest_app_streak, last_active_date")
    .eq("id", profileId)
    .single();

  if (!profile) return;

  let newStreak = profile.app_streak || 0;

  if (profile.last_active_date === today) {
    // Already active today, no change
    return;
  } else if (profile.last_active_date === yesterday) {
    newStreak += 1;
  } else {
    newStreak = 1;
  }

  const longestStreak = Math.max(profile.longest_app_streak || 0, newStreak);

  await supabase
    .from("profiles")
    .update({
      app_streak: newStreak,
      longest_app_streak: longestStreak,
      last_active_date: today,
    })
    .eq("id", profileId);
};

// Award XP + update level on profile
const awardXP = async (profileId, amount, reason) => {
  const today = getToday();

  // Insert XP log
  await supabase.from("xp_logs").insert({
    profile_id: profileId,
    amount,
    reason,
    reference_date: today,
  });

  // Get current XP & level
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp, level")
    .eq("id", profileId)
    .single();

  if (!profile) return { xp: 0, level: 1, leveled_up: false };

  const newXP = Math.max(0, (profile.xp || 0) + amount);
  const newLevel = Math.floor(newXP / 100) + 1;
  const leveledUp = newLevel > (profile.level || 1);

  await supabase
    .from("profiles")
    .update({ xp: newXP, level: newLevel })
    .eq("id", profileId);

  return { xp: newXP, level: newLevel, leveled_up: leveledUp };
};

// Check & apply streak freeze if habit streak would reset
const checkAndApplyFreeze = async (profileId, habitId, lastCompletedDate) => {
  const yesterday = getYesterday();

  // Only relevant if last completed date is NOT yesterday (streak would break)
  if (lastCompletedDate === yesterday) return { freeze_used: false };

  // Check if user has freezes available
  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_freezes_available")
    .eq("id", profileId)
    .single();

  if (!profile || (profile.streak_freezes_available || 0) <= 0) {
    return { freeze_used: false };
  }

  // Check if freeze already used today
  const today = getToday();
  const { data: existing } = await supabase
    .from("streak_freezes")
    .select("id")
    .eq("profile_id", profileId)
    .eq("freeze_date", today)
    .single();

  if (existing) return { freeze_used: false }; // already used today

  // Use a freeze
  await supabase.from("streak_freezes").insert({
    profile_id: profileId,
    habit_id: habitId,
    freeze_date: today,
  });

  await supabase
    .from("profiles")
    .update({ streak_freezes_available: profile.streak_freezes_available - 1 })
    .eq("id", profileId);

  return { freeze_used: true };
};

// ─── API Handlers ──────────────────────────────────────

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

      // Deduct XP for undo
      const xpResult = await awardXP(habit.profile_id, -10, "habit_undo");

      return res.json({
        success: true,
        data,
        action: "unmarked",
        xp_change: -10,
        ...xpResult,
      });
    }

    // MARK COMPLETE: Insert log + update streak
    const { error: logError } = await supabase
      .from("habit_logs")
      .insert({ habit_id: id, profile_id: habit.profile_id, completed_date: today });

    if (logError && logError.code !== "23505") {
      throw { statusCode: 400, message: logError.message };
    }

    // Check freeze before calculating streak
    const freezeResult = await checkAndApplyFreeze(
      habit.profile_id,
      id,
      habit.last_completed_date
    );

    // Calculate streak: if yesterday OR freeze used, continue streak; else reset to 1
    const wasYesterday = habit.last_completed_date === yesterday;
    const continueStreak = wasYesterday || freezeResult.freeze_used;
    const newStreak = continueStreak ? habit.current_streak + 1 : 1;
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

    // Award XP: +10 for habit completion
    let totalXPAwarded = 10;
    let xpResult = await awardXP(habit.profile_id, 10, "habit_complete");

    // Streak bonus: +5 XP if streak >= 3
    if (newStreak >= 3) {
      totalXPAwarded += 5;
      xpResult = await awardXP(habit.profile_id, 5, "streak_bonus");
    }

    // Check if ALL habits done today for bonus +25 XP
    const { data: allHabits } = await supabase
      .from("habits")
      .select("last_completed_date")
      .eq("profile_id", habit.profile_id);

    const allDone =
      allHabits &&
      allHabits.length > 0 &&
      allHabits.every((h) => h.last_completed_date === today);

    if (allDone) {
      totalXPAwarded += 25;
      xpResult = await awardXP(habit.profile_id, 25, "all_habits_complete");
    }

    // Update app streak
    await updateAppStreak(habit.profile_id);

    res.json({
      success: true,
      data,
      action: "marked",
      freeze_used: freezeResult.freeze_used,
      xp_change: totalXPAwarded,
      ...xpResult,
    });
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

// GET /api/habits/analytics/:profileId — Analytics data for charts
const getHabitAnalytics = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const today = new Date();

    // Helper: get date string N days ago
    const daysAgo = (n) => {
      const d = new Date(today);
      d.setDate(d.getDate() - n);
      return d.toISOString().split("T")[0];
    };

    const sevenDaysAgo = daysAgo(6);
    const thirtyDaysAgo = daysAgo(29);

    // 1. Weekly completions (last 7 days from daily_checkins)
    const { data: checkins } = await supabase
      .from("daily_checkins")
      .select("checkin_date, habits_completed")
      .eq("profile_id", profileId)
      .gte("checkin_date", sevenDaysAgo)
      .order("checkin_date", { ascending: true });

    const weeklyCompletions = [];
    for (let i = 6; i >= 0; i--) {
      const date = daysAgo(i);
      const found = (checkins || []).find((c) => c.checkin_date === date);
      const dayLabel = new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
      weeklyCompletions.push({
        date,
        label: dayLabel,
        count: found ? found.habits_completed : 0,
      });
    }

    // 2. Monthly activity (last 30 days from habit_logs)
    const { data: logs } = await supabase
      .from("habit_logs")
      .select("completed_date")
      .eq("profile_id", profileId)
      .gte("completed_date", thirtyDaysAgo);

    const activityMap = {};
    (logs || []).forEach((log) => {
      activityMap[log.completed_date] = (activityMap[log.completed_date] || 0) + 1;
    });

    const monthlyActivity = [];
    for (let i = 29; i >= 0; i--) {
      const date = daysAgo(i);
      monthlyActivity.push({
        date,
        count: activityMap[date] || 0,
      });
    }

    // 3. Category breakdown (total_completions per category)
    const { data: habits } = await supabase
      .from("habits")
      .select("category, total_completions")
      .eq("profile_id", profileId);

    const catMap = {};
    (habits || []).forEach((h) => {
      catMap[h.category] = (catMap[h.category] || 0) + h.total_completions;
    });

    const categoryBreakdown = Object.entries(catMap).map(([category, count]) => ({
      category,
      count,
    }));

    // 4. XP timeline (last 7 days from xp_logs)
    const { data: xpLogs } = await supabase
      .from("xp_logs")
      .select("reference_date, amount")
      .eq("profile_id", profileId)
      .gte("reference_date", sevenDaysAgo);

    const xpMap = {};
    (xpLogs || []).forEach((log) => {
      if (log.amount > 0) {
        xpMap[log.reference_date] = (xpMap[log.reference_date] || 0) + log.amount;
      }
    });

    const xpTimeline = [];
    for (let i = 6; i >= 0; i--) {
      const date = daysAgo(i);
      const dayLabel = new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
      xpTimeline.push({
        date,
        label: dayLabel,
        xp: xpMap[date] || 0,
      });
    }

    res.json({
      success: true,
      data: {
        weeklyCompletions,
        monthlyActivity,
        categoryBreakdown,
        xpTimeline,
      },
    });
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
  getHabitAnalytics,
};
