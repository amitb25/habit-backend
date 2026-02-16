const { supabase } = require("../../config/supabase");

// GET /api/admin/affirmations
const listAffirmations = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 30 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from("custom_affirmations")
      .select("*, profiles(name, email)", { count: "exact" });

    if (category) query = query.eq("category", category);

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

// DELETE /api/admin/affirmations/:id
const deleteAffirmation = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from("custom_affirmations")
      .delete()
      .eq("id", req.params.id);

    if (error) throw { statusCode: 400, message: error.message };
    res.json({ success: true, message: "Affirmation deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { listAffirmations, deleteAffirmation };
