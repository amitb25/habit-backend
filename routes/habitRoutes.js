const express = require("express");
const router = express.Router();
const {
  getHabits,
  createHabit,
  toggleHabit,
  deleteHabit,
  getHabitLogs,
  getHabitAnalytics,
} = require("../controllers/habitController");

router.get("/analytics/:profileId", getHabitAnalytics);
router.get("/:profileId", getHabits);
router.post("/", createHabit);
router.put("/:id/toggle", toggleHabit);
router.delete("/:id", deleteHabit);
router.get("/:id/logs", getHabitLogs);

module.exports = router;
