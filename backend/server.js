const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const profileRoutes = require("./routes/profileRoutes");
const habitRoutes = require("./routes/habitRoutes");
const debtRoutes = require("./routes/debtRoutes");
const dailyTaskRoutes = require("./routes/dailyTaskRoutes");
const financeRoutes = require("./routes/financeRoutes");
const goalRoutes = require("./routes/goalRoutes");
const affirmationRoutes = require("./routes/affirmationRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const errorHandler = require("./middleware/errorHandler");
const { runPhase1Migration } = require("./migrations/phase1");
const { runPhase2Migration } = require("./migrations/phase2_admin");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "HustleKit API is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/debts", debtRoutes);
app.use("/api/daily-tasks", dailyTaskRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/affirmations", affirmationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/exercises", exerciseRoutes);

// Serve admin dashboard static files
app.use("/admin", express.static(path.join(__dirname, "admin-dashboard", "dist")));
app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(__dirname, "admin-dashboard", "dist", "index.html"));
});

// Error handler (must be last)
app.use(errorHandler);

// Run migrations
runPhase1Migration().catch((err) =>
  console.error("[Migration] Failed:", err.message)
);
runPhase2Migration().catch((err) =>
  console.error("[Phase2 Migration] Failed:", err.message)
);

// Local development
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Vercel serverless
module.exports = app;
