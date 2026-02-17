const { supabase } = require("../../config/supabase");

// GET /api/admin/workouts
const listWorkouts = async (req, res, next) => {
  try {
    const { search } = req.query;

    let query = supabase
      .from("workout_plans")
      .select("*");

    if (search) query = query.ilike("name", `%${search}%`);

    query = query.order("sort_order", { ascending: true });

    const { data: plans, error } = await query;

    if (error) throw { statusCode: 400, message: error.message };

    // Get exercises for each plan
    for (const plan of plans) {
      const { data: exercises } = await supabase
        .from("workout_plan_exercises")
        .select("*")
        .eq("plan_id", plan.id)
        .order("sort_order", { ascending: true });

      plan.exercises = exercises || [];
    }

    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/workouts
const createWorkout = async (req, res, next) => {
  try {
    const { name, level, duration, icon, color, sort_order, exercises } = req.body;

    if (!name || !level || !duration || !icon || !color) {
      throw { statusCode: 400, message: "name, level, duration, icon, and color are required" };
    }

    const { data: plan, error } = await supabase
      .from("workout_plans")
      .insert({ name, level, duration, icon, color, sort_order: sort_order || 0 })
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    // Insert exercises if provided
    if (exercises && exercises.length > 0) {
      const exerciseRows = exercises.map((ex, idx) => ({
        plan_id: plan.id,
        exercise_name: ex.exercise_name || ex.name,
        sets: ex.sets || 3,
        reps: ex.reps,
        rest: ex.rest,
        sort_order: ex.sort_order || idx + 1,
      }));

      await supabase.from("workout_plan_exercises").insert(exerciseRows);
    }

    plan.exercises = exercises || [];
    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/workouts/:id
const updateWorkout = async (req, res, next) => {
  try {
    const { name, level, duration, icon, color, sort_order, is_active, exercises } = req.body;

    const { data: plan, error } = await supabase
      .from("workout_plans")
      .update({ name, level, duration, icon, color, sort_order, is_active })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    // Replace exercises if provided
    if (exercises) {
      await supabase.from("workout_plan_exercises").delete().eq("plan_id", req.params.id);

      if (exercises.length > 0) {
        const exerciseRows = exercises.map((ex, idx) => ({
          plan_id: req.params.id,
          exercise_name: ex.exercise_name || ex.name,
          sets: ex.sets || 3,
          reps: ex.reps,
          rest: ex.rest,
          sort_order: ex.sort_order || idx + 1,
        }));

        await supabase.from("workout_plan_exercises").insert(exerciseRows);
      }
    }

    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/workouts/:id
const deleteWorkout = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from("workout_plans")
      .delete()
      .eq("id", req.params.id);

    if (error) throw { statusCode: 400, message: error.message };
    res.json({ success: true, message: "Workout plan deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { listWorkouts, createWorkout, updateWorkout, deleteWorkout };
