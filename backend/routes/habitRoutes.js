const express = require("express");
const router = express.Router();
const {
  getHabits,
  createHabit,
  toggleHabit,
  deleteHabit,
  getHabitLogs,
} = require("../controllers/habitController");

router.get("/:profileId", getHabits);
router.post("/", createHabit);
router.put("/:id/toggle", toggleHabit);
router.delete("/:id", deleteHabit);
router.get("/:id/logs", getHabitLogs);

module.exports = router;
