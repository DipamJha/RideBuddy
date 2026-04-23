const express = require("express");
const router = express.Router();
const { createReview, getDriverReviews } = require("../controllers/reviewController");
const { protect } = require("../middlewares/auth");

router.post("/", protect, createReview);
router.get("/driver/:driverId", getDriverReviews);

module.exports = router;
