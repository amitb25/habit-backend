const supabase = require("../config/supabase");
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

module.exports = {
  getProfile,
  createProfile,
  updateProfile,
  updateManifestation,
  uploadAvatar,
};
