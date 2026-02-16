const jwt = require("jsonwebtoken");
const { supabase } = require("../config/supabase");

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw { statusCode: 401, message: "No token provided" };
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || "hustlekit-admin-secret-key");

    // Verify admin exists and is active
    const { data: admin, error } = await supabase
      .from("admins")
      .select("id, email, name, role, is_active")
      .eq("id", decoded.adminId)
      .single();

    if (error || !admin) {
      throw { statusCode: 401, message: "Admin not found" };
    }

    if (!admin.is_active) {
      throw { statusCode: 403, message: "Admin account is deactivated" };
    }

    req.admin = admin;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
    next(err);
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.admin.role)) {
    return res.status(403).json({ success: false, message: "Insufficient permissions" });
  }
  next();
};

module.exports = { adminAuth, requireRole };
