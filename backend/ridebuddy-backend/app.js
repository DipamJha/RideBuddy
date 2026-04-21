const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const rideRoutes = require("./routes/rideRoutes");

const app = express();

/* ─── Global Middleware ─── */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ─── API Routes ─── */
app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);

/* ─── Health Check ─── */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ─── 404 Handler ─── */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* ─── Global Error Handler ─── */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

module.exports = app;
