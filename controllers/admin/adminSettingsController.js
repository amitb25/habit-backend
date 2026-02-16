const { supabase } = require("../../config/supabase");

// GET /api/admin/settings
const getSettings = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("app_settings")
      .select("*");

    if (error) throw { statusCode: 400, message: error.message };

    // Convert array to object
    const settings = {};
    (data || []).forEach((s) => {
      settings[s.key] = s.value;
    });

    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/settings
const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body; // { key: value, key2: value2 }

    for (const [key, value] of Object.entries(updates)) {
      await supabase
        .from("app_settings")
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    }

    res.json({ success: true, message: "Settings updated" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSettings, updateSettings };
