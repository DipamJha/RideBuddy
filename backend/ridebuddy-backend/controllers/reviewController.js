const Review = require("../models/Review");
const User = require("../models/User");
const Ride = require("../models/Ride");

/**
 * @desc    Create a new review
 * @route   POST /api/reviews
 * @access  Private (Passenger only)
 */
exports.createReview = async (req, res) => {
  try {
    const { rideId, rating, comment } = req.body;

    // 1. Verify the ride exists and the user was a passenger
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    const isPassenger = ride.passengers.some(
      (p) => p.user.toString() === req.user.id
    );

    if (!isPassenger) {
      return res.status(403).json({ message: "You can only review rides you have joined" });
    }

    // 2. Check if already reviewed
    const existingReview = await Review.findOne({
      reviewer: req.user.id,
      ride: rideId,
    });

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this ride" });
    }

    // 3. Create review
    const review = await Review.create({
      reviewer: req.user.id,
      driver: ride.driver,
      ride: rideId,
      rating,
      comment,
    });

    // 4. Update driver's average rating
    const driver = await User.findById(ride.driver);
    const currentNumReviews = driver.numReviews || 0;
    const currentRating = driver.rating || 0;
    
    const totalRating = (currentRating * currentNumReviews) + rating;
    const newNumReviews = currentNumReviews + 1;
    const newAverageRating = totalRating / newNumReviews;

    driver.rating = Math.round(newAverageRating * 10) / 10; // Round to 1 decimal place
    driver.numReviews = newNumReviews;
    await driver.save();

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get reviews for a driver
 * @route   GET /api/reviews/driver/:driverId
 * @access  Public
 */
exports.getDriverReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ driver: req.params.driverId })
      .populate("reviewer", "firstName lastName avatar")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
