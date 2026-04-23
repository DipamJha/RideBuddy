const express = require("express");
const router = express.Router();
const {
  createAlert,
  getMyAlerts,
  deleteAlert,
} = require("../controllers/alertController");
const { protect } = require("../middlewares/auth");

// POST /api/alerts — create a ride alert (protected)
router.post("/", protect, createAlert);

// GET /api/alerts/my — get user's alerts (protected)
router.get("/my", protect, getMyAlerts);

// DELETE /api/alerts/:id — cancel an alert (protected)
router.delete("/:id", protect, deleteAlert);

module.exports = router;
