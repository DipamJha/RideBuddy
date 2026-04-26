const Ride = require("../models/Ride");
const RideAlert = require("../models/RideAlert");
const User = require("../models/User");
const { sendRideAlert, sendNotification } = require("../services/telegramBot");

/**
 * @desc    Create a new ride (offer a ride)
 * @route   POST /api/rides
 * @access  Private
 */
const createRide = async (req, res) => {
  try {
    const { from, to, date, time, seats, price, vehicle, vehicleType, amenities, telegramChatId } = req.body;

    // Link telegramChatId to user profile if provided and not already saved
    if (telegramChatId) {
      const user = await User.findById(req.user._id);
      if (user && !user.telegramChatId) {
        user.telegramChatId = telegramChatId;
        await user.save();
      }
    }

    const ride = await Ride.create({
      driver: req.user._id,
      from,
      to,
      date,
      time,
      seats: parseInt(seats),
      price: parseFloat(price),
      vehicle: vehicle || "",
      vehicleType: vehicleType || "Other",
      amenities: amenities || [],
    });

    // Populate driver info before sending response
    await ride.populate("driver", "firstName lastName avatar rating trips");

    // ─── Trigger matching ride alerts ───
    try {
      const matchingAlerts = await RideAlert.find({
        from: { $regex: ride.from, $options: "i" },
        to: { $regex: ride.to, $options: "i" },
        status: "active",
        expiresAt: { $gt: new Date() },
      });

      for (const alert of matchingAlerts) {
        try {
          await sendRideAlert(alert.telegramChatId, ride, alert._id);
          alert.status = "triggered";
          alert.triggeredRide = ride._id;
          await alert.save();
          console.log(`🔔 Alert triggered for ${alert.from} → ${alert.to} (Chat: ${alert.telegramChatId})`);
        } catch (alertErr) {
          console.error("Failed to send alert:", alertErr.message);
        }
      }

      if (matchingAlerts.length > 0) {
        console.log(`📢 ${matchingAlerts.length} Telegram alert(s) sent for ride ${ride.from} → ${ride.to}`);
      }
    } catch (alertError) {
      // Don't fail ride creation if alerts fail
      console.error("Alert matching error:", alertError);
    }

    res.status(201).json({
      success: true,
      message: "Ride created successfully",
      ride,
    });
  } catch (error) {
    console.error("Create ride error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating ride",
    });
  }
};

/**
 * @desc    Search / list rides with optional filters
 * @route   GET /api/rides
 * @query   from, to, date, seats, status
 * @access  Public
 */
const searchRides = async (req, res) => {
  try {
    const { from, to, date, seats, status } = req.query;
    const filter = {};

    // Text search with case-insensitive regex
    if (from) filter.from = { $regex: from, $options: "i" };
    if (to) filter.to = { $regex: to, $options: "i" };

    // Date filter — only show rides that haven't passed yet
    if (date) {
      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = { $gte: searchDate, $lt: nextDay };
    } else {
      // No date specified → default to today and future rides only
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filter.date = { $gte: today };
    }

    // Available seats filter (default to at least 1 seat available)
    const requestedSeats = seats ? parseInt(seats) : 1;
    filter.$expr = {
      $gte: [{ $subtract: ["$seats", "$seatsBooked"] }, requestedSeats],
    };

    // Status filter (default to active rides only)
    filter.status = status || "active";

    let rides = await Ride.find(filter)
      .populate("driver", "firstName lastName avatar rating trips")
      .populate("passengers", "firstName lastName avatar")
      .sort({ date: 1, time: 1 })
      .limit(50);

    // Filter out rides whose date+time has already passed (handles today's expired rides)
    const now = new Date();
    rides = rides.filter((ride) => {
      const rideDateObj = new Date(ride.date);
      const timeParts = ride.time.split(":");
      let hours = parseInt(timeParts[0]);
      let minutes = parseInt(timeParts[1]) || 0;

      if (ride.time.toLowerCase().includes("pm") && hours < 12) hours += 12;
      if (ride.time.toLowerCase().includes("am") && hours === 12) hours = 0;

      rideDateObj.setHours(hours, minutes, 0, 0);
      return rideDateObj.getTime() > now.getTime();
    });

    // Return only the top 20 after filtering
    rides = rides.slice(0, 20);

    res.json({
      success: true,
      count: rides.length,
      rides,
    });
  } catch (error) {
    console.error("Search rides error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching rides",
    });
  }
};

/**
 * @desc    Get a single ride by ID
 * @route   GET /api/rides/:id
 * @access  Public
 */
const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("driver", "firstName lastName avatar rating trips email")
      .populate("passengers", "firstName lastName avatar");

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    res.json({ success: true, ride });
  } catch (error) {
    console.error("Get ride error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @desc    Join a ride as a passenger
 * @route   POST /api/rides/:id/join
 * @access  Private
 */
const joinRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    // Check if ride is active
    if (ride.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This ride is no longer available",
      });
    }

    // Check if ride departure has already passed
    const timeParts = ride.time.split(":");
    let depHours = parseInt(timeParts[0]);
    let depMinutes = parseInt(timeParts[1]) || 0;
    if (ride.time.toLowerCase().includes("pm") && depHours < 12) depHours += 12;
    if (ride.time.toLowerCase().includes("am") && depHours === 12) depHours = 0;
    const departureDateObj = new Date(ride.date);
    departureDateObj.setHours(depHours, depMinutes, 0, 0);
    if (departureDateObj.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "This ride has already departed",
      });
    }

    // Check if seats are available
    if (ride.seatsBooked >= ride.seats) {
      return res.status(400).json({
        success: false,
        message: "No seats available on this ride",
      });
    }

    // Check if user is the driver
    if (ride.driver.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot join your own ride",
      });
    }

    // Check if user already joined
    if (ride.passengers.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You have already joined this ride",
      });
    }

    // Add passenger and increment seats booked
    ride.passengers.push(req.user._id);
    ride.seatsBooked += 1;

    // Mark as full if no seats left
    if (ride.seatsBooked >= ride.seats) {
      ride.status = "full";
    }

    await ride.save();

    // Populate and return updated ride
    await ride.populate("driver", "firstName lastName avatar rating trips telegramChatId");
    await ride.populate("passengers", "firstName lastName avatar");

    // 📢 Notify driver via Telegram if they have linked their account
    if (ride.driver.telegramChatId) {
      const seatsLeft = ride.seats - ride.seatsBooked;
      const dateStr = new Date(ride.date).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });

      let driverMsg = `🆕 *New Passenger!*\n\n` +
        `*${req.user.firstName} ${req.user.lastName || ""}* just booked a seat on your ride (via Web):\n\n` +
        `📍 *${ride.from}* → *${ride.to}*\n` +
        `📅 ${dateStr} at ${ride.time}\n` +
        `💺 ${seatsLeft} seat${seatsLeft !== 1 ? "s" : ""} remaining\n\n`;

      if (seatsLeft === 0) {
        driverMsg += `🎉 *Your ride is now FULL!*\nHave a safe journey! 🚗✨`;
      } else {
        driverMsg += `Check your dashboard for details. 📋`;
      }

      try {
        await sendNotification(ride.driver.telegramChatId, driverMsg);
      } catch (err) {
        console.error("Failed to send driver notification:", err.message);
      }
    }

    res.json({
      success: true,
      message: "Successfully joined the ride!",
      ride,
    });
  } catch (error) {
    console.error("Join ride error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while joining ride",
    });
  }
};

/**
 * @desc    Get rides for the current user (as driver or passenger)
 * @route   GET /api/rides/my
 * @access  Private
 */
const getMyRides = async (req, res) => {
  try {
    const userId = req.user._id;

    // Rides the user is driving
    const offeredRides = await Ride.find({ driver: userId })
      .populate("passengers", "firstName lastName avatar")
      .sort({ date: -1 });

    // Rides the user has joined
    const joinedRides = await Ride.find({ passengers: userId })
      .populate("driver", "firstName lastName avatar rating trips")
      .sort({ date: -1 });

    res.json({
      success: true,
      offered: offeredRides,
      joined: joinedRides,
    });
  } catch (error) {
    console.error("Get my rides error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @desc    Cancel a joined ride as a passenger
 * @route   POST /api/rides/:id/cancel
 * @access  Private
 */
const cancelJoinedRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("driver", "firstName lastName telegramChatId");

    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }

    if (!ride.passengers.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: "You are not a passenger on this ride" });
    }

    const timeParts = ride.time.split(":");
    let hours = parseInt(timeParts[0]);
    let minutes = parseInt(timeParts[1]);

    if (ride.time.toLowerCase().includes("pm") && hours < 12) hours += 12;
    if (ride.time.toLowerCase().includes("am") && hours === 12) hours = 0;

    const rideDateObj = new Date(ride.date);
    rideDateObj.setHours(hours, minutes, 0, 0);

    const timeDiffMs = rideDateObj.getTime() - Date.now();
    const threeHoursMs = 3 * 60 * 60 * 1000;

    if (timeDiffMs < threeHoursMs) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot cancel a ride within 3 hours of departure." 
      });
    }

    ride.passengers = ride.passengers.filter(p => p.toString() !== req.user._id.toString());
    ride.seatsBooked -= 1;
    if (ride.status === "full") {
      ride.status = "active";
    }

    await ride.save();

    if (ride.driver.telegramChatId) {
      const dateStr = new Date(ride.date).toLocaleDateString("en-IN", {
        weekday: "short", day: "numeric", month: "short"
      });
      const seatsLeft = ride.seats - ride.seatsBooked;
      const driverMsg = `⚠️ *Ride Cancellation!*\n\n*${req.user.firstName} ${req.user.lastName || ""}* has cancelled their booking on your ride:\n\n📍 *${ride.from}* → *${ride.to}*\n📅 ${dateStr} at ${ride.time}\n\nYour ride now has ${seatsLeft} seat${seatsLeft !== 1 ? "s" : ""} available.`;
      
      try {
        await sendNotification(ride.driver.telegramChatId, driverMsg);
      } catch (err) {
        console.error("Failed to notify driver of cancellation:", err);
      }
    }

    res.json({ success: true, message: "Ride cancelled successfully", ride });
  } catch (error) {
    console.error("Cancel ride error:", error);
    res.status(500).json({ success: false, message: "Server error while cancelling ride" });
  }
};

/**
 * @desc    Cancel an entire ride trip (as a driver)
 * @route   DELETE /api/rides/:id
 * @access  Private
 */
const cancelOfferedRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate("passengers", "firstName telegramChatId");

    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }

    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You are not authorized to cancel this trip" });
    }

    // 3-hour check for driver
    const timeParts = ride.time.split(":");
    let hours = parseInt(timeParts[0]);
    let minutes = parseInt(timeParts[1]);
    if (ride.time.toLowerCase().includes("pm") && hours < 12) hours += 12;
    if (ride.time.toLowerCase().includes("am") && hours === 12) hours = 0;

    const rideDateObj = new Date(ride.date);
    rideDateObj.setHours(hours, minutes, 0, 0);

    const timeDiffMs = rideDateObj.getTime() - Date.now();
    const threeHoursMs = 3 * 60 * 60 * 1000;

    if (timeDiffMs < threeHoursMs) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot cancel a trip within 3 hours of departure." 
      });
    }

    // Mark as cancelled
    ride.status = "cancelled";
    await ride.save();

    // 📢 Notify all passengers via Telegram
    const dateStr = new Date(ride.date).toLocaleDateString("en-IN", {
      weekday: "short", day: "numeric", month: "short"
    });

    for (const passenger of ride.passengers) {
      if (passenger.telegramChatId) {
        const passMsg = `❌ *Ride Cancelled by Driver!*\n\n` +
          `Sorry, the driver has cancelled the trip:\n` +
          `📍 *${ride.from}* → *${ride.to}*\n` +
          `📅 ${dateStr} at ${ride.time}\n\n` +
          `Please look for another ride on the website. 😔`;
        
        try {
          await sendNotification(passenger.telegramChatId, passMsg);
        } catch (err) {
          console.error(`Failed to notify passenger ${passenger._id}:`, err.message);
        }
      }
    }

    res.json({ success: true, message: "Trip cancelled successfully and passengers notified." });
  } catch (error) {
    console.error("Cancel trip error:", error);
    res.status(500).json({ success: false, message: "Server error while cancelling trip" });
  }
};

module.exports = { createRide, searchRides, getRideById, joinRide, getMyRides, cancelJoinedRide, cancelOfferedRide };
