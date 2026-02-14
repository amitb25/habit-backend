const express = require("express");
const router = express.Router();
const {
  getCustomAffirmations,
  createAffirmation,
  toggleFavorite,
  deleteAffirmation,
} = require("../controllers/affirmationController");

router.get("/:profileId", getCustomAffirmations);
router.post("/", createAffirmation);
router.put("/:id/favorite", toggleFavorite);
router.delete("/:id", deleteAffirmation);

module.exports = router;
