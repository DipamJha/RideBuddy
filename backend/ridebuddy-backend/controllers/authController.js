const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 */
const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Create user (password is hashed via pre-save hook)
    const { telegramChatId } = req.body;
    const user = await User.create({ firstName, lastName, email, password, telegramChatId });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        rating: user.rating,
        trips: user.trips,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during signup",
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Link telegram if provided
    if (req.body.telegramChatId && !user.telegramChatId) {
      user.telegramChatId = req.body.telegramChatId;
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        rating: user.rating,
        trips: user.trips,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        rating: user.rating,
        trips: user.trips,
      },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (avatar) user.avatar = avatar;
    if (req.body.telegramChatId) user.telegramChatId = req.body.telegramChatId;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        rating: user.rating,
        trips: user.trips,
        telegramChatId: user.telegramChatId,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during profile update",
    });
  }
};

/**
 * @desc    Google OAuth Callback handler
 */
const googleCallback = async (req, res) => {
  try {
    // req.user is populated by passport
    if (!req.user) {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }

    // Generate token
    const token = generateToken(req.user._id);

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const tgChatId = req.session.tg_chat_id;
    
    let redirectUrl = `${frontendUrl}/login?token=${token}`;
    if (tgChatId) {
      redirectUrl += `&tg_chat_id=${tgChatId}`;
      delete req.session.tg_chat_id; // Clean up
    }
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Google callback error:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/login?error=server_error`);
  }
};

module.exports = { signup, login, getMe, updateProfile, googleCallback };
