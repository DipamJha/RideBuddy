const RideAlert = require("../models/RideAlert");
const User = require("../models/User");

/**
 * @desc    Create a ride alert (notify me when this route is available)
 * @route   POST /api/alerts
 * @access  Private
 */
const createAlert = async (req, res) => {
  try {
    const { from, to, date, seats, telegramChatId } = req.body;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "Pickup and drop-off locations are required",
      });
    }

    if (!telegramChatId) {
      return res.status(400).json({
        success: false,
        message: "Telegram Chat ID is required. Send /start to @RideBuddyBot to get yours.",
      });
    }

    // Save telegramChatId to user profile if not already saved
    const user = await User.findById(req.user._id);
    if (!user.telegramChatId) {
      user.telegramChatId = telegramChatId;
      await user.save();
    }

    // Check if user already has an active alert for this exact route
    const existingAlert = await RideAlert.findOne({
      user: req.user._id,
      from: { $regex: `^${from}$`, $options: "i" },
      to: { $regex: `^${to}$`, $options: "i" },
      status: "active",
    });

    if (existingAlert) {
      return res.status(400).json({
        success: false,
        message: "You already have an active alert for this route",
      });
    }

    const alert = await RideAlert.create({
      user: req.user._id,
      from,
      to,
      date: date || null,
      seats: seats || 1,
      telegramChatId,
    });

    res.status(201).json({
      success: true,
      message: "Alert created! You'll be notified on Telegram when a matching ride is available.",
      alert,
    });
  } catch (error) {
    console.error("Create alert error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating alert",
    });
  }
};

/**
 * @desc    Get current user's alerts
 * @route   GET /api/alerts/my
 * @access  Private
 */
const getMyAlerts = async (req, res) => {
  try {
    const alerts = await RideAlert.find({ user: req.user._id })
      .populate("triggeredRide", "from to date time price")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      alerts,
    });
  } catch (error) {
    console.error("Get my alerts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @desc    Cancel/delete an alert
 * @route   DELETE /api/alerts/:id
 * @access  Private
 */
const deleteAlert = async (req, res) => {
  try {
    const alert = await RideAlert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    // Ensure user owns this alert
    if (alert.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this alert",
      });
    }

    alert.status = "cancelled";
    await alert.save();

    res.json({
      success: true,
      message: "Alert cancelled",
    });
  } catch (error) {
    console.error("Delete alert error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { createAlert, getMyAlerts, deleteAlert };
