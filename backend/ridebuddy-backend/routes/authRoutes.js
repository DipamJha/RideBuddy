const express = require("express");
const router = express.Router();
const { signup, login, getMe } = require("../controllers/authController");
const { protect } = require("../middlewares/auth");
const { signupRules, loginRules, validate } = require("../utils/validators");

// POST /api/auth/signup
router.post("/signup", signupRules, validate, signup);

// POST /api/auth/login
router.post("/login", loginRules, validate, login);

// GET /api/auth/me (protected)
router.get("/me", protect, getMe);

module.exports = router;
