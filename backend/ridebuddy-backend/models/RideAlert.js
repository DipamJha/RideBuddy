const mongoose = require("mongoose");

const rideAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    from: {
      type: String,
      required: [true, "Pickup location is required"],
      trim: true,
    },
    to: {
      type: String,
      required: [true, "Drop-off location is required"],
      trim: true,
    },
    telegramChatId: {
      type: String,
      required: [true, "Telegram Chat ID is required"],
    },
    date: {
      type: Date,
      default: null, // null = any date
    },
    seats: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ["active", "triggered", "booked", "expired", "cancelled"],
      default: "active",
    },
    triggeredRide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient matching when new rides are created
rideAlertSchema.index({ from: "text", to: "text" });
rideAlertSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model("RideAlert", rideAlertSchema);
