const express = require("express");
const router = express.Router();
const {
  createRide,
  searchRides,
  getRideById,
  joinRide,
  getMyRides,
} = require("../controllers/rideController");
const { protect } = require("../middlewares/auth");
const { createRideRules, validate } = require("../utils/validators");

// GET /api/rides/my (must be before /:id to avoid conflict)
router.get("/my", protect, getMyRides);

// GET /api/rides — search/list rides (public)
router.get("/", searchRides);

// GET /api/rides/:id — get single ride (public)
router.get("/:id", getRideById);

// POST /api/rides — create a ride (protected)
router.post("/", protect, createRideRules, validate, createRide);

// POST /api/rides/:id/join — join a ride (protected)
router.post("/:id/join", protect, joinRide);

module.exports = router;
