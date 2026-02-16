const { supabase } = require("../../config/supabase");

// ─── CATEGORIES ──────────────────────────────────────────────────────

// GET /api/admin/exercises/categories
const listCategories = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("exercise_categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw { statusCode: 400, message: error.message };
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/exercises/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, icon, color, description, sort_order } = req.body;
    if (!name || !icon || !color) {
      throw { statusCode: 400, message: "Name, icon, and color are required" };
    }

    const { data, error } = await supabase
      .from("exercise_categories")
      .insert({ name, icon, color, description, sort_order: sort_order || 0 })
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/exercises/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const { name, icon, color, description, sort_order, is_active } = req.body;

    const { data, error } = await supabase
      .from("exercise_categories")
      .update({ name, icon, color, description, sort_order, is_active })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/exercises/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from("exercise_categories")
      .delete()
      .eq("id", req.params.id);

    if (error) throw { statusCode: 400, message: error.message };
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    next(err);
  }
};

// ─── EXERCISES ───────────────────────────────────────────────────────

// GET /api/admin/exercises
const listExercises = async (req, res, next) => {
  try {
    const { category_id, level, search, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from("exercises")
      .select("*, exercise_categories(name, icon, color)", { count: "exact" });

    if (category_id) query = query.eq("category_id", category_id);
    if (level) query = query.eq("level", level);
    if (search) query = query.ilike("name", `%${search}%`);

    query = query.order("sort_order", { ascending: true })
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

// POST /api/admin/exercises
const createExercise = async (req, res, next) => {
  try {
    const { category_id, name, level, sets, reps, rest, tip, video_url, sort_order } = req.body;

    if (!category_id || !name || !level || !reps || !rest) {
      throw { statusCode: 400, message: "category_id, name, level, reps, and rest are required" };
    }

    const { data, error } = await supabase
      .from("exercises")
      .insert({ category_id, name, level, sets: sets || 3, reps, rest, tip, video_url, sort_order: sort_order || 0 })
      .select("*, exercise_categories(name, icon, color)")
      .single();

    if (error) throw { statusCode: 400, message: error.message };
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/exercises/:id
const updateExercise = async (req, res, next) => {
  try {
    const { category_id, name, level, sets, reps, rest, tip, video_url, sort_order, is_active } = req.body;

    const { data, error } = await supabase
      .from("exercises")
      .update({ category_id, name, level, sets, reps, rest, tip, video_url, sort_order, is_active })
      .eq("id", req.params.id)
      .select("*, exercise_categories(name, icon, color)")
      .single();

    if (error) throw { statusCode: 400, message: error.message };
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/exercises/:id
const deleteExercise = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from("exercises")
      .delete()
      .eq("id", req.params.id);

    if (error) throw { statusCode: 400, message: error.message };
    res.json({ success: true, message: "Exercise deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listExercises,
  createExercise,
  updateExercise,
  deleteExercise,
};
