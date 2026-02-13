const supabase = require("../config/supabase");

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

    // Create auth user in Supabase Auth
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

    // Authenticate with Supabase Auth
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      throw { statusCode: 401, message: "Invalid email or password" };
    }

    // Get profile by email
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

module.exports = { signup, login };
