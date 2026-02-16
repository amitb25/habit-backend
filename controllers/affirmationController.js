const { supabase } = require("../config/supabase");

// GET /api/affirmations/:profileId
const getCustomAffirmations = async (req, res, next) => {
  try {
    const { profileId } = req.params;

    const { data, error } = await supabase
      .from("custom_affirmations")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/affirmations
const createAffirmation = async (req, res, next) => {
  try {
    const { profile_id, text, category } = req.body;

    if (!profile_id || !text) {
      throw { statusCode: 400, message: "profile_id and text are required" };
    }

    const { data, error } = await supabase
      .from("custom_affirmations")
      .insert({
        profile_id,
        text,
        category: category || "personal",
      })
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/affirmations/:id/favorite — Toggle favorite
const toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: current, error: fetchErr } = await supabase
      .from("custom_affirmations")
      .select("is_favorite")
      .eq("id", id)
      .single();

    if (fetchErr) throw { statusCode: 404, message: "Affirmation not found" };

    const { data, error } = await supabase
      .from("custom_affirmations")
      .update({ is_favorite: !current.is_favorite })
      .eq("id", id)
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/affirmations/:id
const deleteAffirmation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("custom_affirmations").delete().eq("id", id);
    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, message: "Affirmation deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCustomAffirmations,
  createAffirmation,
  toggleFavorite,
  deleteAffirmation,
};
