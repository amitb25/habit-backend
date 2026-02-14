const express = require("express");
const router = express.Router();
const { signup, login, changePassword, googleAuth } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/change-password", changePassword);
router.post("/google", googleAuth);

module.exports = router;
