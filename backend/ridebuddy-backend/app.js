const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport");
const authRoutes = require("./routes/authRoutes");
const rideRoutes = require("./routes/rideRoutes");
const alertRoutes = require("./routes/alertRoutes");

const app = express();
app.set("trust proxy", 1);

/* ─── Global Middleware ─── */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session for Passport (Required for OAuth)
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* ─── API Routes ─── */
app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/reviews", require("./routes/reviewRoutes"));

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
