const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    driver: {
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
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
      trim: true,
    },
    seats: {
      type: Number,
      required: [true, "Number of seats is required"],
      min: [1, "At least 1 seat is required"],
      max: 8,
    },
    seatsBooked: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Price per seat is required"],
      min: 0,
    },
    vehicle: {
      type: String,
      trim: true,
      default: "",
    },
    vehicleType: {
      type: String,
      enum: ["SUV", "Sedan", "MPV", "Hatchback", "Other"],
      default: "Other",
    },
    amenities: {
      type: [String],
      default: [],
    },
    passengers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient search queries
rideSchema.index({ from: "text", to: "text" });
rideSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model("Ride", rideSchema);
