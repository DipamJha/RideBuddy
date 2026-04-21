const { body, validationResult } = require("express-validator");

/**
 * Signup validation rules
 */
const signupRules = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ max: 50 })
    .withMessage("First name cannot exceed 50 characters"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ max: 50 })
    .withMessage("Last name cannot exceed 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

/**
 * Login validation rules
 */
const loginRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

/**
 * Create ride validation rules
 */
const createRideRules = [
  body("from").trim().notEmpty().withMessage("Pickup location is required"),
  body("to").trim().notEmpty().withMessage("Drop-off location is required"),
  body("date").notEmpty().withMessage("Date is required"),
  body("time").trim().notEmpty().withMessage("Time is required"),
  body("seats")
    .notEmpty()
    .withMessage("Seats is required")
    .isInt({ min: 1, max: 8 })
    .withMessage("Seats must be between 1 and 8"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
];

/**
 * Middleware to check validation results and return errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = { signupRules, loginRules, createRideRules, validate };
