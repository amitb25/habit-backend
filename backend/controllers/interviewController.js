const supabase = require("../config/supabase");

// GET /api/interviews/:profileId
const getInterviews = async (req, res, next) => {
  try {
    const { profileId } = req.params;

    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("profile_id", profileId)
      .order("applied_date", { ascending: false });

    if (error) throw { statusCode: 400, message: error.message };

    // Calculate summary
    const summary = {
      total: data.length,
      applied: data.filter((i) => i.status === "applied").length,
      in_progress: data.filter((i) =>
        ["phone_screen", "technical", "hr_round"].includes(i.status)
      ).length,
      offers: data.filter((i) => i.status === "offer").length,
      rejected: data.filter((i) => i.status === "rejected").length,
      ghosted: data.filter((i) => i.status === "ghosted").length,
    };

    res.json({ success: true, data, summary });
  } catch (err) {
    next(err);
  }
};

// POST /api/interviews
const createInterview = async (req, res, next) => {
  try {
    const { profile_id, company, role, salary, notes, applied_date } = req.body;

    if (!profile_id || !company || !role) {
      throw {
        statusCode: 400,
        message: "profile_id, company, and role are required",
      };
    }

    const { data, error } = await supabase
      .from("interviews")
      .insert({ profile_id, company, role, salary, notes, applied_date })
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/interviews/:id
const updateInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("interviews")
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

// DELETE /api/interviews/:id
const deleteInterview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("interviews").delete().eq("id", id);

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, message: "Interview deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
};
