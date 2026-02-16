const express = require("express");
const router = express.Router();
const {
  getInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
} = require("../controllers/interviewController");

router.get("/:profileId", getInterviews);
router.post("/", createInterview);
router.put("/:id", updateInterview);
router.delete("/:id", deleteInterview);

module.exports = router;
