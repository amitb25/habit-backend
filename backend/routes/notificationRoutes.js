const express = require("express");
const router = express.Router();
const {
  getNotificationPrefs,
  updateNotificationPrefs,
} = require("../controllers/notificationController");

router.get("/:profileId", getNotificationPrefs);
router.put("/:profileId", updateNotificationPrefs);

module.exports = router;
