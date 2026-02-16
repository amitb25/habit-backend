const express = require("express");
const router = express.Router();
const { getExercises, getWorkoutPlans, getExerciseVideos } = require("../controllers/exerciseController");

router.get("/", getExercises);
router.get("/plans", getWorkoutPlans);
router.get("/videos", getExerciseVideos);

module.exports = router;
