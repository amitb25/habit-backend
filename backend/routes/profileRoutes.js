const express = require("express");
const router = express.Router();
const {
  getProfile,
  createProfile,
  updateProfile,
  updateManifestation,
  uploadAvatar,
} = require("../controllers/profileController");

router.get("/:id", getProfile);
router.post("/", createProfile);
router.put("/:id", updateProfile);
router.put("/:id/manifestation", updateManifestation);
router.put("/:id/avatar", uploadAvatar);

module.exports = router;
