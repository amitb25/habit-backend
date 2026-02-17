const { supabase } = require("../config/supabase");

// GET /api/water/:profileId?date=
const getWaterIntake = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const date = req.query.date || new Date().toISOString().split("T")[0];

    let { data, error } = await supabase
      .from("water_intakes")
      .select("*")
      .eq("profile_id", profileId)
      .eq("log_date", date)
      .single();

    if (error && error.code === "PGRST116") {
      // No row for today - return defaults
      data = { glasses: 0, goal: 8, log_date: date };
    } else if (error) {
      throw { statusCode: 400, message: error.message };
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/water — add glass (upsert for today)
const addGlass = async (req, res, next) => {
  try {
    const { profile_id, date } = req.body;
    const log_date = date || new Date().toISOString().split("T")[0];

    if (!profile_id) throw { statusCode: 400, message: "profile_id is required" };

    // Check if row exists for today
    const { data: existing } = await supabase
      .from("water_intakes")
      .select("*")
      .eq("profile_id", profile_id)
      .eq("log_date", log_date)
      .single();

    let data;
    if (existing) {
      const { data: updated, error } = await supabase
        .from("water_intakes")
        .update({ glasses: existing.glasses + 1 })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw { statusCode: 400, message: error.message };
      data = updated;
    } else {
      const { data: created, error } = await supabase
        .from("water_intakes")
        .insert({ profile_id, glasses: 1, goal: 8, log_date })
        .select()
        .single();
      if (error) throw { statusCode: 400, message: error.message };
      data = created;
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/water/remove — remove glass
const removeGlass = async (req, res, next) => {
  try {
    const { profile_id, date } = req.body;
    const log_date = date || new Date().toISOString().split("T")[0];

    const { data: existing } = await supabase
      .from("water_intakes")
      .select("*")
      .eq("profile_id", profile_id)
      .eq("log_date", log_date)
      .single();

    if (!existing || existing.glasses <= 0) {
      return res.json({ success: true, data: existing || { glasses: 0, goal: 8, log_date } });
    }

    const { data, error } = await supabase
      .from("water_intakes")
      .update({ glasses: existing.glasses - 1 })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/water/goal — update daily goal
const updateGoal = async (req, res, next) => {
  try {
    const { profile_id, goal } = req.body;
    const log_date = new Date().toISOString().split("T")[0];

    if (!profile_id || !goal) throw { statusCode: 400, message: "profile_id and goal required" };

    const { data: existing } = await supabase
      .from("water_intakes")
      .select("*")
      .eq("profile_id", profile_id)
      .eq("log_date", log_date)
      .single();

    let data;
    if (existing) {
      const { data: updated, error } = await supabase
        .from("water_intakes")
        .update({ goal })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw { statusCode: 400, message: error.message };
      data = updated;
    } else {
      const { data: created, error } = await supabase
        .from("water_intakes")
        .insert({ profile_id, glasses: 0, goal, log_date })
        .select()
        .single();
      if (error) throw { statusCode: 400, message: error.message };
      data = created;
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/water/analytics/:profileId — last 7 days
const getWaterAnalytics = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);

    const { data, error } = await supabase
      .from("water_intakes")
      .select("*")
      .eq("profile_id", profileId)
      .gte("log_date", weekAgo.toISOString().split("T")[0])
      .lte("log_date", today.toISOString().split("T")[0])
      .order("log_date", { ascending: true });

    if (error) throw { statusCode: 400, message: error.message };

    // Fill missing days with 0
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const entry = data.find((e) => e.log_date === dateStr);
      days.push({
        date: dateStr,
        day: d.toLocaleDateString("en", { weekday: "short" }),
        glasses: entry ? entry.glasses : 0,
        goal: entry ? entry.goal : 8,
      });
    }

    const totalGlasses = days.reduce((s, d) => s + d.glasses, 0);
    const avgGlasses = Math.round((totalGlasses / 7) * 10) / 10;

    res.json({ success: true, data: { days, totalGlasses, avgGlasses } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getWaterIntake, addGlass, removeGlass, updateGoal, getWaterAnalytics };
