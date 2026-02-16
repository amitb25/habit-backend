const { supabase } = require("../config/supabase");

// GET /api/exercises — returns all categories with exercises (for mobile app)
const getExercises = async (req, res, next) => {
  try {
    const { data: categories, error: catErr } = await supabase
      .from("exercise_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (catErr) throw { statusCode: 400, message: catErr.message };

    const { data: exercises, error: exErr } = await supabase
      .from("exercises")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (exErr) throw { statusCode: 400, message: exErr.message };

    // Shape data to match the hardcoded exerciseData format
    const exerciseData = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      exercises: exercises
        .filter((ex) => ex.category_id === cat.id)
        .map((ex) => ({
          level: ex.level,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          rest: ex.rest,
          tip: ex.tip,
          video_url: ex.video_url,
        })),
    }));

    res.json({ success: true, data: exerciseData });
  } catch (err) {
    next(err);
  }
};

// GET /api/exercises/plans — returns all workout plans (for mobile app)
const getWorkoutPlans = async (req, res, next) => {
  try {
    const { data: plans, error: planErr } = await supabase
      .from("workout_plans")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (planErr) throw { statusCode: 400, message: planErr.message };

    const { data: allExercises, error: exErr } = await supabase
      .from("workout_plan_exercises")
      .select("*")
      .order("sort_order", { ascending: true });

    if (exErr) throw { statusCode: 400, message: exErr.message };

    const workoutPlans = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      level: plan.level,
      duration: plan.duration,
      icon: plan.icon,
      color: plan.color,
      exercises: allExercises
        .filter((ex) => ex.plan_id === plan.id)
        .map((ex) => ({
          name: ex.exercise_name,
          sets: ex.sets,
          reps: ex.reps,
          rest: ex.rest,
        })),
    }));

    res.json({ success: true, data: workoutPlans });
  } catch (err) {
    next(err);
  }
};

// GET /api/exercises/videos — returns video URL map (for mobile app)
const getExerciseVideos = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("exercises")
      .select("name, video_url")
      .not("video_url", "is", null)
      .eq("is_active", true);

    if (error) throw { statusCode: 400, message: error.message };

    const videos = {};
    data.forEach((ex) => {
      videos[ex.name] = { uri: ex.video_url };
    });

    res.json({ success: true, data: videos });
  } catch (err) {
    next(err);
  }
};

module.exports = { getExercises, getWorkoutPlans, getExerciseVideos };
