const express = require("express");
const router = express.Router();
const {
  getProfile,
  createProfile,
  updateProfile,
  updateManifestation,
  uploadAvatar,
  grantWeeklyFreeze,
  getXPHistory,
  clearAllData,
  deleteAccount,
} = require("../controllers/profileController");

router.get("/:id", getProfile);
router.post("/", createProfile);
router.put("/:id", updateProfile);
router.put("/:id/manifestation", updateManifestation);
router.put("/:id/avatar", uploadAvatar);
router.post("/:id/grant-weekly-freeze", grantWeeklyFreeze);
router.get("/:id/xp-history", getXPHistory);
router.delete("/:id/data", clearAllData);
router.delete("/:id/account", deleteAccount);

module.exports = router;
