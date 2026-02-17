const { supabase } = require("../config/supabase");

// GET /api/notifications/:profileId
const getNotificationPrefs = async (req, res, next) => {
  try {
    const { profileId } = req.params;

    let { data, error } = await supabase
      .from("notification_prefs")
      .select("*")
      .eq("profile_id", profileId)
      .single();

    if (error && error.code === "PGRST116") {
      // No prefs yet - return defaults
      data = {
        water_enabled: true,
        water_interval_hrs: 2,
        sleep_enabled: true,
        sleep_bedtime: "22:00",
        habit_enabled: true,
        habit_time: "08:00",
        daily_task_enabled: true,
        daily_task_time: "09:00",
      };
    } else if (error) {
      throw { statusCode: 400, message: error.message };
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/notifications/:profileId
const updateNotificationPrefs = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const updates = req.body;

    // Check if row exists
    const { data: existing } = await supabase
      .from("notification_prefs")
      .select("id")
      .eq("profile_id", profileId)
      .single();

    let data;
    if (existing) {
      const { data: updated, error } = await supabase
        .from("notification_prefs")
        .update(updates)
        .eq("profile_id", profileId)
        .select()
        .single();
      if (error) throw { statusCode: 400, message: error.message };
      data = updated;
    } else {
      const { data: created, error } = await supabase
        .from("notification_prefs")
        .insert({ profile_id: profileId, ...updates })
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

module.exports = { getNotificationPrefs, updateNotificationPrefs };
