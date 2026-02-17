const express = require("express");
const router = express.Router();
const {
  getSleepLogs,
  createSleepLog,
  updateSleepLog,
  deleteSleepLog,
  getSleepAnalytics,
} = require("../controllers/sleepController");

router.get("/analytics/:profileId", getSleepAnalytics);
router.get("/:profileId", getSleepLogs);
router.post("/", createSleepLog);
router.put("/:id", updateSleepLog);
router.delete("/:id", deleteSleepLog);

module.exports = router;
