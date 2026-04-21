const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * JWT Authentication Middleware
 * Extracts token from Authorization header, verifies it,
 * and attaches the user to req.user
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for Bearer token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — no token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and attach to request
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — user no longer exists",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized — invalid token",
    });
  }
};

module.exports = { protect };
