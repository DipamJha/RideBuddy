const Ride = require("../models/Ride");

/**
 * @desc    Create a new ride (offer a ride)
 * @route   POST /api/rides
 * @access  Private
 */
const createRide = async (req, res) => {
  try {
    const { from, to, date, time, seats, price, vehicle, vehicleType, amenities } = req.body;

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

    // Date filter (rides on or after the given date)
    if (date) {
      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = { $gte: searchDate, $lt: nextDay };
    }

    // Available seats filter
    if (seats) {
      filter.$expr = {
        $gte: [{ $subtract: ["$seats", "$seatsBooked"] }, parseInt(seats)],
      };
    }

    // Status filter (default to active rides only)
    filter.status = status || "active";

    const rides = await Ride.find(filter)
      .populate("driver", "firstName lastName avatar rating trips")
      .populate("passengers", "firstName lastName avatar")
      .sort({ date: 1, time: 1 })
      .limit(20);

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
    await ride.save();

    // Populate and return updated ride
    await ride.populate("driver", "firstName lastName avatar rating trips");
    await ride.populate("passengers", "firstName lastName avatar");

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

module.exports = { createRide, searchRides, getRideById, joinRide, getMyRides };
