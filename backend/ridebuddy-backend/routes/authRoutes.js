const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { signup, login, getMe, updateProfile, googleCallback } = require("../controllers/authController");
const { protect } = require("../middlewares/auth");
const { signupRules, loginRules, validate } = require("../utils/validators");

// POST /api/auth/signup
router.post("/signup", signupRules, validate, signup);

// POST /api/auth/login
router.post("/login", loginRules, validate, login);

// GET /api/auth/me (protected)
router.get("/me", protect, getMe);

// PUT /api/auth/profile (protected)
router.put("/profile", protect, updateProfile);

// ─── Google OAuth Routes ───
// @desc    Initiate Google OAuth
router.get(
  "/google",
  (req, res, next) => {
    if (req.query.tg_chat_id) {
      req.session.tg_chat_id = req.query.tg_chat_id;
    }
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// @desc    Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  googleCallback
);

module.exports = router;
