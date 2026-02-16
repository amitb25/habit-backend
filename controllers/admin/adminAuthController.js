const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabase } = require("../../config/supabase");

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "hustlekit-admin-secret-key";
const JWT_EXPIRES = "24h";

const generateToken = (admin) => {
  return jwt.sign(
    { adminId: admin.id, email: admin.email, role: admin.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
};

// POST /api/admin/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw { statusCode: 400, message: "Email and password are required" };
    }

    const { data: admin, error } = await supabase
      .from("admins")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !admin) {
      throw { statusCode: 401, message: "Invalid email or password" };
    }

    if (!admin.is_active) {
      throw { statusCode: 403, message: "Account is deactivated" };
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      throw { statusCode: 401, message: "Invalid email or password" };
    }

    // Update last login
    await supabase
      .from("admins")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", admin.id);

    const token = generateToken(admin);

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/auth/me
const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        id: req.admin.id,
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw { statusCode: 400, message: "Current and new password are required" };
    }

    if (newPassword.length < 6) {
      throw { statusCode: 400, message: "New password must be at least 6 characters" };
    }

    const { data: admin, error } = await supabase
      .from("admins")
      .select("password_hash")
      .eq("id", req.admin.id)
      .single();

    if (error || !admin) {
      throw { statusCode: 404, message: "Admin not found" };
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isMatch) {
      throw { statusCode: 401, message: "Current password is incorrect" };
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await supabase
      .from("admins")
      .update({ password_hash: hash })
      .eq("id", req.admin.id);

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe, changePassword };
