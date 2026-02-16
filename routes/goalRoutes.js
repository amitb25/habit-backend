const express = require("express");
const router = express.Router();
const {
  getGoals,
  createGoal,
  updateGoal,
  updateProgress,
  deleteGoal,
  getMilestones,
  addMilestone,
  toggleMilestone,
  deleteMilestone,
} = require("../controllers/goalController");

router.get("/:profileId", getGoals);
router.post("/", createGoal);
router.put("/:id", updateGoal);
router.put("/:id/progress", updateProgress);
router.delete("/:id", deleteGoal);

// Milestones
router.get("/:id/milestones", getMilestones);
router.post("/:id/milestones", addMilestone);
router.put("/milestones/:milestoneId/toggle", toggleMilestone);
router.delete("/milestones/:milestoneId", deleteMilestone);

module.exports = router;
