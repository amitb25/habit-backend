const express = require("express");
const router = express.Router();
const {
  getDailyTasks,
  createDailyTask,
  toggleDailyTask,
  updateDailyTask,
  deleteDailyTask,
} = require("../controllers/dailyTaskController");

router.get("/:profileId", getDailyTasks);
router.post("/", createDailyTask);
router.put("/:id/toggle", toggleDailyTask);
router.put("/:id", updateDailyTask);
router.delete("/:id", deleteDailyTask);

module.exports = router;
