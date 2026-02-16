const { supabase } = require("../config/supabase");
const { decode } = require("base64-arraybuffer");

// PUT /api/profiles/:id/avatar
const uploadAvatar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { base64Image } = req.body;

    if (!base64Image) {
      throw { statusCode: 400, message: "base64Image is required" };
    }

    const fileName = `${id}.jpg`;

    // Upload to Supabase Storage (upsert to overwrite existing)
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, decode(base64Image), {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) throw { statusCode: 500, message: uploadError.message };

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const avatar_url = `${urlData.publicUrl}?t=${Date.now()}`;

    // Update profile with avatar URL
    const { data, error } = await supabase
      .from("profiles")
      .update({ avatar_url })
      .eq("id", id)
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/profiles/:id
const getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw { statusCode: 404, message: "Profile not found" };

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/profiles
const createProfile = async (req, res, next) => {
  try {
    const { name, email, manifestation } = req.body;

    if (!name || !email) {
      throw { statusCode: 400, message: "Name and email are required" };
    }

    const { data, error } = await supabase
      .from("profiles")
      .insert({ name, email, manifestation })
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/profiles/:id
const updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("profiles")
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

// PUT /api/profiles/:id/manifestation
const updateManifestation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { manifestation } = req.body;

    if (!manifestation) {
      throw { statusCode: 400, message: "Manifestation text is required" };
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ manifestation })
      .eq("id", id)
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/profiles/:id/grant-weekly-freeze
const grantWeeklyFreeze = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("streak_freezes_available, last_freeze_granted_week")
      .eq("id", id)
      .single();

    if (fetchError) throw { statusCode: 404, message: "Profile not found" };

    // Check if freeze already granted this week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    const weekStart = startOfWeek.toISOString().split("T")[0];

    if (profile.last_freeze_granted_week === weekStart) {
      return res.json({
        success: true,
        message: "Freeze already granted this week",
        streak_freezes_available: profile.streak_freezes_available,
      });
    }

    // Cap at 3 freezes
    const newFreezes = Math.min(3, (profile.streak_freezes_available || 0) + 1);

    const { data, error } = await supabase
      .from("profiles")
      .update({
        streak_freezes_available: newFreezes,
        last_freeze_granted_week: weekStart,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, data, streak_freezes_available: newFreezes });
  } catch (err) {
    next(err);
  }
};

// GET /api/profiles/:id/xp-history
const getXPHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("xp_logs")
      .select("*")
      .eq("profile_id", id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/profiles/:id/data
const clearAllData = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Delete all user data from related tables
    const tables = [
      "habits",
      "debts",
      "daily_tasks",
      "transactions",
      "goals",
      "milestones",
      "custom_affirmations",
      "xp_logs",
      "daily_checkins",
      "streak_freezes",
      "debt_payments",
    ];

    for (const table of tables) {
      await supabase.from(table).delete().eq("profile_id", id);
    }

    // Reset profile stats
    const { data, error } = await supabase
      .from("profiles")
      .update({
        xp: 0,
        level: 1,
        app_streak: 0,
        longest_app_streak: 0,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.json({ success: true, message: "All data cleared", data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/profiles/:id/account
const deleteAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!email) {
      throw { statusCode: 400, message: "Email is required to delete account" };
    }

    // Delete all user data from related tables
    const tables = [
      "habits",
      "debts",
      "daily_tasks",
      "transactions",
      "goals",
      "milestones",
      "custom_affirmations",
      "xp_logs",
      "daily_checkins",
      "streak_freezes",
      "debt_payments",
    ];

    for (const table of tables) {
      await supabase.from(table).delete().eq("profile_id", id);
    }

    // Delete profile
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (profileError) throw { statusCode: 400, message: profileError.message };

    // Find and delete auth user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (!listError) {
      const authUser = users.find((u) => u.email === email);
      if (authUser) {
        await supabase.auth.admin.deleteUser(authUser.id);
      }
    }

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  createProfile,
  updateProfile,
  updateManifestation,
  uploadAvatar,
  grantWeeklyFreeze,
  getXPHistory,
  clearAllData,
  deleteAccount,
};
