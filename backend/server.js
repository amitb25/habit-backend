const express = require("express");
const cors = require("cors");
require("dotenv").config();

const profileRoutes = require("./routes/profileRoutes");
const habitRoutes = require("./routes/habitRoutes");
const debtRoutes = require("./routes/debtRoutes");
const dailyTaskRoutes = require("./routes/dailyTaskRoutes");
// const interviewRoutes = require("./routes/interviewRoutes");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");

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
// app.use("/api/interviews", interviewRoutes);

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
