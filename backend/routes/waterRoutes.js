const express = require("express");
const router = express.Router();
const {
  getWaterIntake,
  addGlass,
  removeGlass,
  updateGoal,
  getWaterAnalytics,
} = require("../controllers/waterController");

router.get("/analytics/:profileId", getWaterAnalytics);
router.get("/:profileId", getWaterIntake);
router.post("/", addGlass);
router.post("/remove", removeGlass);
router.put("/goal", updateGoal);

module.exports = router;
