const { supabase, supabaseAuth } = require("../config/supabase");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

// POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw { statusCode: 400, message: "Name, email and password are required" };
    }

    if (password.length < 4) {
      throw { statusCode: 400, message: "Password must be at least 4 characters" };
    }

    // Create auth user in Supabase Auth (admin client bypasses RLS)
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      if (authError.message.includes("already been registered")) {
        throw { statusCode: 400, message: "Email already registered. Try logging in." };
      }
      throw { statusCode: 400, message: authError.message };
    }

    // Check if profile already exists (for existing users)
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, name, email, manifestation, created_at")
      .eq("email", email)
      .single();

    if (existingProfile) {
      return res.status(200).json({ success: true, data: existingProfile });
    }

    // Create new profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({ name, email })
      .select("id, name, email, manifestation, created_at")
      .single();

    if (profileError) throw { statusCode: 400, message: profileError.message };

    res.status(201).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw { statusCode: 400, message: "Email and password are required" };
    }

    // Use separate auth client so signInWithPassword doesn't pollute admin client session
    const { error: authError } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      throw { statusCode: 401, message: "Invalid email or password" };
    }

    // Get profile by email (admin client — bypasses RLS)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, email, manifestation, created_at")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      throw { statusCode: 401, message: "Profile not found. Please sign up first." };
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
      throw { statusCode: 400, message: "Email, current password and new password are required" };
    }

    if (newPassword.length < 4) {
      throw { statusCode: 400, message: "New password must be at least 4 characters" };
    }

    // Verify current password
    const { error: authError } = await supabaseAuth.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (authError) {
      throw { statusCode: 401, message: "Current password is incorrect" };
    }

    // Find auth user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw { statusCode: 500, message: listError.message };

    const authUser = users.find((u) => u.email === email);
    if (!authUser) {
      throw { statusCode: 404, message: "Auth user not found" };
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      authUser.id,
      { password: newPassword }
    );

    if (updateError) throw { statusCode: 500, message: updateError.message };

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/google
const googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      throw { statusCode: 400, message: "Google ID token is required" };
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_WEB_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    if (!email) {
      throw { statusCode: 400, message: "Google account has no email" };
    }

    // Check if profile already exists by email (handles account linking)
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, name, email, manifestation, created_at")
      .eq("email", email)
      .single();

    if (existingProfile) {
      return res.json({ success: true, data: existingProfile });
    }

    // New user: create Supabase Auth user with a random password
    const randomPassword = `google_${googleId}_${Date.now()}`;
    const { error: authError } = await supabase.auth.admin.createUser({
      email,
      password: randomPassword,
      email_confirm: true,
    });

    if (authError && !authError.message.includes("already been registered")) {
      throw { statusCode: 400, message: authError.message };
    }

    // Create profile row
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({ name: name || email.split("@")[0], email })
      .select("id, name, email, manifestation, created_at")
      .single();

    if (profileError) throw { statusCode: 400, message: profileError.message };

    res.status(201).json({ success: true, data: profile });
  } catch (err) {
    if (err.statusCode) return next(err);
    // Google token verification failure
    next({ statusCode: 401, message: "Invalid Google token" });
  }
};

module.exports = { signup, login, changePassword, googleAuth };
