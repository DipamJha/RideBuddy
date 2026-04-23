const TelegramBot = require("node-telegram-bot-api");
const User = require("../models/User");
const Ride = require("../models/Ride");
const RideAlert = require("../models/RideAlert");

let bot = null;
const userSessions = {};

/**
 * Initialize the Telegram bot with polling.
 * Called once on server startup.
 */
function initBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.log("⚠️  TELEGRAM_BOT_TOKEN not set — Telegram bot disabled");
    return;
  }

  bot = new TelegramBot(token, { polling: true });

  console.log("🤖 Telegram bot started (polling)");

  // ─── /start command ───
  bot.onText(/\/start(.*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const deepLinkParam = match[1]?.trim(); // e.g. /start userId

    // Try to link account if deep-link param is a valid userId
    if (deepLinkParam && deepLinkParam.match(/^[a-f\d]{24}$/i)) {
      try {
        const user = await User.findById(deepLinkParam);
        if (user) {
          user.telegramChatId = String(chatId);
          await user.save();
          bot.sendMessage(
            chatId,
            `✅ *Account linked!*\n\nHey ${user.firstName}! Your Telegram is now connected to RideBuddy.\n\nYou'll receive ride alerts and booking confirmations right here. 🚗`,
            { parse_mode: "Markdown" }
          );
          return;
        }
      } catch (err) {
        console.error("Deep link error:", err);
      }
    }

    // Default /start response
    bot.sendMessage(
      chatId,
      `🚗 *Welcome to RideBuddy Bot!*\n\n` +
        `Your Chat ID is: \`${chatId}\`\n\n` +
        `📋 *How to get started:*\n` +
        `1. Copy your Chat ID above\n` +
        `2. Go to RideBuddy website\n` +
        `3. Search for a ride → Click "Notify Me"\n` +
        `4. Paste your Chat ID\n\n` +
        `You'll receive instant notifications when matching rides become available! 🔔`,
      { parse_mode: "Markdown" }
    );
  });

  // ─── /myid command (quick shortcut) ───
  bot.onText(/\/myid/, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      `Your Chat ID is: \`${msg.chat.id}\``,
      { parse_mode: "Markdown" }
    );
  });

  // ─── /cancel command ───
  bot.onText(/\/cancel/, (msg) => {
    const chatId = msg.chat.id;
    if (userSessions[chatId]) {
      delete userSessions[chatId];
      bot.sendMessage(chatId, "🛑 Action cancelled. Type /offer or /search to start again.");
    } else {
      bot.sendMessage(chatId, "No active action to cancel.");
    }
  });

  // ─── /offer command ───
  bot.onText(/\/offer/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await User.findOne({ telegramChatId: String(chatId) });
    if (!user) {
      return bot.sendMessage(chatId, "⚠️ You must link your account first! Type /start <your_user_id> or use the link on the website.");
    }
    userSessions[chatId] = { action: 'offer', step: 'from', data: {}, userId: user._id };
    bot.sendMessage(chatId, "🚗 Let's offer a ride! (Type /cancel anytime to abort)\n\n📍 *Where are you departing from?*", { parse_mode: "Markdown" });
  });

  // ─── /search command ───
  bot.onText(/\/search/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await User.findOne({ telegramChatId: String(chatId) });
    if (!user) {
      return bot.sendMessage(chatId, "⚠️ You must link your account first! Type /start <your_user_id> or use the link on the website.");
    }
    userSessions[chatId] = { action: 'search', step: 'from', data: {}, userId: user._id };
    bot.sendMessage(chatId, "🔍 Let's find you a ride! (Type /cancel anytime to abort)\n\n📍 *Where are you departing from?*", { parse_mode: "Markdown" });
  });

  // ─── /myrides command ───
  bot.onText(/\/myrides/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await User.findOne({ telegramChatId: String(chatId) });
    if (!user) {
      return bot.sendMessage(chatId, "⚠️ You must link your account first!");
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find active or full rides the user has joined
      const joinedRides = await Ride.find({
        passengers: user._id,
        date: { $gte: today },
        status: { $in: ["active", "full"] },
      }).populate("driver", "firstName lastName");

      if (joinedRides.length === 0) {
        return bot.sendMessage(chatId, "You haven't joined any upcoming rides.");
      }

      await bot.sendMessage(chatId, "🎫 *Your Upcoming Joined Rides:*", { parse_mode: "Markdown" });

      for (const ride of joinedRides) {
        const dateStr = new Date(ride.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
        const message = `📍 *${ride.from}* → *${ride.to}*\n📅 ${dateStr} at ${ride.time}\n💰 ₹${ride.price} per seat\n🚗 Driver: ${ride.driver?.firstName || "Unknown"}`;
        
        await bot.sendMessage(chatId, message, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "❌ Cancel Ride", callback_data: `cancel_${ride._id}` }]
            ],
          },
        });
      }
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, "⚠️ Server error while fetching rides.");
    }
  });

  // ─── /help command ───
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `🤖 *RideBuddy Bot Commands* 🤖\n\n` +
      `Here is what I can do for you:\n\n` +
      `🚗 */offer* - Offer a new ride to other passengers\n` +
      `🔍 */search* - Find and join available rides\n` +
      `🎫 */myrides* - View your upcoming joined rides and cancel them if needed\n` +
      `🛑 */cancel* - Abort any active conversation (like offering or searching)\n` +
      `🆔 */myid* - Get your Telegram Chat ID to link your account\n` +
      `ℹ️ */help* - Show this message again\n\n` +
      `_💡 Tip: You'll also receive automatic notifications here when someone joins your ride, or when a ride you're tracking becomes available!_`;
      
    bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
  });

  // ─── General Message Handler for State Machine ───
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith("/")) return;

    const session = userSessions[chatId];
    if (!session) return;

    if (session.action === "offer") {
      await handleOfferFlow(chatId, text, session);
    } else if (session.action === "search") {
      await handleSearchFlow(chatId, text, session);
    }
  });

  // ─── Callback Query Handler (inline keyboard buttons) ───
  bot.on("callback_query", async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const data = callbackQuery.data;

    // Always answer to stop loading spinner
    await bot.answerCallbackQuery(callbackQuery.id);

    try {
      // ── Cancel Ride (from /myrides command) ──
      if (data.startsWith("cancel_")) {
        const rideId = data.split("_")[1];
        
        const user = await User.findOne({ telegramChatId: String(chatId) });
        if (!user) return;

        const ride = await Ride.findById(rideId).populate("driver", "firstName lastName telegramChatId");
        if (!ride) {
          return bot.editMessageText("⚠️ This ride is no longer available.", { chat_id: chatId, message_id: messageId });
        }

        if (!ride.passengers.includes(user._id)) {
          return bot.editMessageText("⚠️ You are not a passenger on this ride.", { chat_id: chatId, message_id: messageId });
        }

        // 3-hour check
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
          return bot.editMessageText("⚠️ *Cannot Cancel*\n\nYou cannot cancel a ride within 3 hours of departure.", { 
            chat_id: chatId, message_id: messageId, parse_mode: "Markdown" 
          });
        }

        // Apply cancellation
        ride.passengers = ride.passengers.filter(p => p.toString() !== user._id.toString());
        ride.seatsBooked -= 1;
        if (ride.status === "full") ride.status = "active";
        await ride.save();

        await bot.editMessageText(`❌ *Ride Cancelled*\n\nYou have successfully cancelled your seat for:\n📍 *${ride.from}* → *${ride.to}*`, { 
          chat_id: chatId, message_id: messageId, parse_mode: "Markdown" 
        });

        // Notify driver
        if (ride.driver.telegramChatId) {
          const dateStr = new Date(ride.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
          const seatsLeft = ride.seats - ride.seatsBooked;
          const driverMsg = `⚠️ *Ride Cancellation!*\n\n*${user.firstName} ${user.lastName || ""}* has cancelled their booking on your ride:\n\n📍 *${ride.from}* → *${ride.to}*\n📅 ${dateStr} at ${ride.time}\n\nYour ride now has ${seatsLeft} seat${seatsLeft !== 1 ? "s" : ""} available.`;
          await bot.sendMessage(ride.driver.telegramChatId, driverMsg, { parse_mode: "Markdown" });
        }
        return;
      }

      // ── Join Ride (from /search command) ──
      if (data.startsWith("join_")) {
        const parts = data.split("_"); // join_{rideId}
        const rideId = parts[1];

        const user = await User.findOne({ telegramChatId: String(chatId) });
        if (!user) {
          await bot.editMessageText("⚠️ You must link your account first!", { chat_id: chatId, message_id: messageId });
          return;
        }

        const ride = await Ride.findById(rideId).populate("driver", "firstName lastName telegramChatId");
        if (!ride) {
          await bot.editMessageText("⚠️ This ride is no longer available.", { chat_id: chatId, message_id: messageId });
          return;
        }

        if (ride.seatsBooked >= ride.seats) {
          await bot.editMessageText("😔 Sorry, this ride is now full.", { chat_id: chatId, message_id: messageId });
          return;
        }

        if (ride.driver._id.toString() === user._id.toString()) {
          await bot.editMessageText("⚠️ You can't book your own ride!", { chat_id: chatId, message_id: messageId });
          return;
        }

        if (ride.passengers.map((p) => p.toString()).includes(user._id.toString())) {
          await bot.editMessageText("✅ You've already joined this ride!", { chat_id: chatId, message_id: messageId });
          return;
        }

        // Add passenger
        ride.passengers.push(user._id);
        ride.seatsBooked += 1;
        if (ride.seatsBooked >= ride.seats) ride.status = "full";
        await ride.save();

        const seatsLeft = ride.seats - ride.seatsBooked;
        const dateStr = new Date(ride.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

        await bot.editMessageText(
          `🎉 *Ride Booked Successfully!*\n\n📍 *${ride.from}* → *${ride.to}*\n📅 ${dateStr} at ${ride.time}\n💰 ₹${ride.price} per seat\n💺 ${seatsLeft} seat${seatsLeft !== 1 ? "s" : ""} remaining\n\n🚗 Driver: *${ride.driver.firstName} ${ride.driver.lastName || ""}*\n\nHave a great trip! 🛣️`,
          { chat_id: chatId, message_id: messageId, parse_mode: "Markdown" }
        );

        if (ride.driver.telegramChatId) {
          let driverMsg = `🆕 *New Passenger!*\n\n*${user.firstName} ${user.lastName || ""}* just booked a seat on your ride:\n\n📍 *${ride.from}* → *${ride.to}*\n📅 ${dateStr} at ${ride.time}\n💺 ${seatsLeft} seat${seatsLeft !== 1 ? "s" : ""} remaining\n\n`;
          if (seatsLeft === 0) driverMsg += `🎉 *Your ride is now FULL!*\nHave a safe journey! 🚗✨`;
          else driverMsg += `Check your dashboard for details. 📋`;
          await bot.sendMessage(ride.driver.telegramChatId, driverMsg, { parse_mode: "Markdown" });
        }
      }

      // ── Book Ride (from automated alerts) ──
      if (data.startsWith("book_")) {
        const parts = data.split("_"); // book_{alertId}_{rideId}
        const alertId = parts[1];
        const rideId = parts[2];

        const alert = await RideAlert.findById(alertId).populate("user");
        if (!alert) {
          await bot.editMessageText("⚠️ This alert has expired.", {
            chat_id: chatId,
            message_id: messageId,
          });
          return;
        }

        // Check if already booked
        if (alert.status === "booked") {
          await bot.editMessageText("✅ You've already booked this ride!", {
            chat_id: chatId,
            message_id: messageId,
          });
          return;
        }

        const ride = await Ride.findById(rideId)
          .populate("driver", "firstName lastName telegramChatId");

        if (!ride) {
          await bot.editMessageText("⚠️ This ride is no longer available.", {
            chat_id: chatId,
            message_id: messageId,
          });
          return;
        }

        // Check seats
        if (ride.seatsBooked >= ride.seats) {
          await bot.editMessageText("😔 Sorry, this ride is now full.", {
            chat_id: chatId,
            message_id: messageId,
          });
          alert.status = "expired";
          await alert.save();
          return;
        }

        // Check if user is the driver
        if (ride.driver._id.toString() === alert.user._id.toString()) {
          await bot.editMessageText("⚠️ You can't book your own ride!", {
            chat_id: chatId,
            message_id: messageId,
          });
          return;
        }

        // Check if already a passenger
        if (ride.passengers.map((p) => p.toString()).includes(alert.user._id.toString())) {
          await bot.editMessageText("✅ You've already joined this ride!", {
            chat_id: chatId,
            message_id: messageId,
          });
          alert.status = "booked";
          await alert.save();
          return;
        }

        // ── AUTO-BOOK: Add passenger ──
        ride.passengers.push(alert.user._id);
        ride.seatsBooked += 1;
        
        if (ride.seatsBooked >= ride.seats) {
          ride.status = "full";
        }
        
        await ride.save();

        // Update alert status
        alert.status = "booked";
        await alert.save();

        const seatsLeft = ride.seats - ride.seatsBooked;
        const dateStr = new Date(ride.date).toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });

        // ✅ Confirm to passenger
        await bot.editMessageText(
          `🎉 *Ride Booked Successfully!*\n\n` +
            `📍 *${ride.from}* → *${ride.to}*\n` +
            `📅 ${dateStr} at ${ride.time}\n` +
            `💰 ₹${ride.price} per seat\n` +
            `💺 ${seatsLeft} seat${seatsLeft !== 1 ? "s" : ""} remaining\n\n` +
            `🚗 Driver: *${ride.driver.firstName} ${ride.driver.lastName || ""}*\n\n` +
            `Have a great trip! 🛣️`,
          {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: "Markdown",
          }
        );

        // 📢 Notify driver
        if (ride.driver.telegramChatId) {
          let driverMsg = `🆕 *New Passenger!*\n\n` +
            `*${alert.user.firstName} ${alert.user.lastName || ""}* just booked a seat on your ride:\n\n` +
            `📍 *${ride.from}* → *${ride.to}*\n` +
            `📅 ${dateStr} at ${ride.time}\n` +
            `💺 ${seatsLeft} seat${seatsLeft !== 1 ? "s" : ""} remaining\n\n`;

          if (seatsLeft === 0) {
            driverMsg += `🎉 *Your ride is now FULL!*\nHave a safe journey! 🚗✨`;
          } else {
            driverMsg += `Check your dashboard for details. 📋`;
          }

          await bot.sendMessage(
            ride.driver.telegramChatId,
            driverMsg,
            { parse_mode: "Markdown" }
          );
        }
      }

      // ── Skip Ride ──
      if (data.startsWith("skip_")) {
        const alertId = data.split("_")[1];

        const alert = await RideAlert.findById(alertId);
        if (alert) {
          alert.status = "expired";
          await alert.save();
        }

        await bot.editMessageText(
          "⏭️ Skipped. You won't be notified about this ride.\n\nYou can set new alerts anytime on the website! 🔔",
          {
            chat_id: chatId,
            message_id: messageId,
          }
        );
      }
    } catch (error) {
      console.error("Telegram callback error:", error);
      await bot.sendMessage(chatId, "⚠️ Something went wrong. Please try again on the website.");
    }
  });
}

/**
 * Send a ride alert notification to a user's Telegram.
 * Shows ride details with "Book Now" and "Skip" inline buttons.
 */
async function sendRideAlert(chatId, ride, alertId) {
  if (!bot) return;

  const dateStr = new Date(ride.date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const seatsLeft = ride.seats - (ride.seatsBooked || 0);
  const driverName = ride.driver?.firstName
    ? `${ride.driver.firstName} ${ride.driver.lastName || ""}`
    : "Unknown";

  const amenitiesStr =
    ride.amenities?.length > 0 ? `\n🎁 ${ride.amenities.join(", ")}` : "";

  const message =
    `🚗 *Ride Available!*\n\n` +
    `📍 *${ride.from}* → *${ride.to}*\n` +
    `📅 ${dateStr} at ${ride.time}\n` +
    `💰 *₹${ride.price}* per seat\n` +
    `💺 ${seatsLeft} seat${seatsLeft !== 1 ? "s" : ""} available\n` +
    `🚙 ${ride.vehicleType || "Other"}${ride.vehicle ? ` — ${ride.vehicle}` : ""}` +
    amenitiesStr +
    `\n👤 Driver: *${driverName}*\n\n` +
    `Would you like to book this ride?`;

  await bot.sendMessage(chatId, message, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "✅ Book Now",
            callback_data: `book_${alertId}_${ride._id}`,
          },
          {
            text: "❌ Skip",
            callback_data: `skip_${alertId}`,
          },
        ],
      ],
    },
  });
}

/**
 * Send a direct notification to a user's Telegram (general purpose).
 */
async function sendNotification(chatId, message) {
  if (!bot) return;
  await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
}

/**
 * Get the bot instance (for testing or advanced use).
 */
function getBot() {
  return bot;
}

// ─── State Machine Handlers ───
async function handleOfferFlow(chatId, text, session) {
  const step = session.step;

  if (step === "from") {
    session.data.from = text;
    session.step = "to";
    bot.sendMessage(chatId, "🎯 *Where are you heading to?*", { parse_mode: "Markdown" });
  } else if (step === "to") {
    session.data.to = text;
    session.step = "date";
    bot.sendMessage(chatId, "📅 *What date?* (YYYY-MM-DD)", { parse_mode: "Markdown" });
  } else if (step === "date") {
    if (isNaN(Date.parse(text))) {
      return bot.sendMessage(chatId, "⚠️ Invalid date format. Please use YYYY-MM-DD (e.g., 2026-05-15).");
    }
    session.data.date = new Date(text);
    session.step = "time";
    bot.sendMessage(chatId, "⏰ *What time?* (e.g., 10:30 AM)", { parse_mode: "Markdown" });
  } else if (step === "time") {
    session.data.time = text;
    session.step = "seats";
    bot.sendMessage(chatId, "💺 *How many seats are available?* (Number)", { parse_mode: "Markdown" });
  } else if (step === "seats") {
    if (isNaN(text) || parseInt(text) <= 0) {
      return bot.sendMessage(chatId, "⚠️ Please enter a valid number of seats.");
    }
    session.data.seats = parseInt(text);
    session.step = "price";
    bot.sendMessage(chatId, "💰 *What is the price per seat?* (Number in ₹)", { parse_mode: "Markdown" });
  } else if (step === "price") {
    if (isNaN(text) || parseFloat(text) <= 0) {
      return bot.sendMessage(chatId, "⚠️ Please enter a valid price.");
    }
    session.data.price = parseFloat(text);
    session.step = "vehicle";
    bot.sendMessage(chatId, "🚙 *What vehicle will you be driving?* (e.g., Honda City - Sedan)", { parse_mode: "Markdown" });
  } else if (step === "vehicle") {
    session.data.vehicle = text.trim();
    session.step = "amenities";
    bot.sendMessage(chatId, "🎁 *Any amenities?* (e.g., AC, Music, Pet-friendly. Type 'None' if none)", { parse_mode: "Markdown" });
  } else if (step === "amenities") {
    const amenities = text.toLowerCase().trim() === 'none' ? [] : text.split(",").map(a => a.trim()).filter(a => a);
    session.data.amenities = amenities;
    
    try {
      const ride = await Ride.create({
        driver: session.userId,
        from: session.data.from.trim(),
        to: session.data.to.trim(),
        date: session.data.date,
        time: session.data.time,
        seats: session.data.seats,
        price: session.data.price,
        vehicle: session.data.vehicle,
        vehicleType: "Other",
        amenities: session.data.amenities,
      });

      // 🔥 Send Alerts to matching users
      const matchingAlerts = await RideAlert.find({
        from: { $regex: ride.from, $options: "i" },
        to: { $regex: ride.to, $options: "i" },
        status: "active",
        expiresAt: { $gt: new Date() },
      });

      for (const alert of matchingAlerts) {
        try {
          // sendRideAlert is already defined in this file
          await sendRideAlert(alert.telegramChatId, ride, alert._id);
          alert.status = "triggered";
          alert.triggeredRide = ride._id;
          await alert.save();
        } catch (alertErr) {
          console.error("Failed to send alert:", alertErr.message);
        }
      }

      bot.sendMessage(chatId, `✅ *Ride Offered Successfully!*\n\n📍 ${ride.from} → ${ride.to}\n📅 ${ride.date.toDateString()} at ${ride.time}\n\nYour ride is now live on the website! 🎉`, { parse_mode: "Markdown" });
      delete userSessions[chatId];
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, "⚠️ Server error while offering ride. Try again later.");
      delete userSessions[chatId];
    }
  }
}

async function handleSearchFlow(chatId, text, session) {
  const step = session.step;

  if (step === "from") {
    session.data.from = text;
    session.step = "to";
    bot.sendMessage(chatId, "🎯 *Where are you heading to?*", { parse_mode: "Markdown" });
  } else if (step === "to") {
    session.data.to = text;
    
    try {
      bot.sendMessage(chatId, "🔍 Searching for rides...");
      
      const filter = {
        from: { $regex: session.data.from.trim(), $options: "i" },
        to: { $regex: session.data.to.trim(), $options: "i" },
        status: "active",
        date: { $gte: new Date(new Date().setHours(0,0,0,0)) },
        driver: { $ne: session.userId } // Exclude the user's own rides
      };
      
      filter.$expr = {
        $gte: [{ $subtract: ["$seats", "$seatsBooked"] }, 1],
      };

      const rides = await Ride.find(filter)
        .populate("driver", "firstName lastName")
        .sort({ date: 1 })
        .limit(5);

      if (rides.length === 0) {
        bot.sendMessage(chatId, "😔 No rides found for this route. Try creating an alert on the website!");
      } else {
        await bot.sendMessage(chatId, `✅ Found ${rides.length} ride(s):`);
        for (const ride of rides) {
          const dateStr = new Date(ride.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
          const seatsLeft = ride.seats - (ride.seatsBooked || 0);
          const driverName = ride.driver?.firstName ? `${ride.driver.firstName} ${ride.driver.lastName || ""}` : "Unknown";
          
          const message = `🚗 *Ride Available!*\n\n📍 *${ride.from}* → *${ride.to}*\n📅 ${dateStr} at ${ride.time}\n💰 *₹${ride.price}* per seat\n💺 ${seatsLeft} seat${seatsLeft !== 1 ? "s" : ""} available\n👤 Driver: *${driverName}*\n\nWould you like to book this ride?`;

          await bot.sendMessage(chatId, message, {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "✅ Book Now", callback_data: `join_${ride._id}` }]
              ],
            },
          });
        }
      }
      delete userSessions[chatId];
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, "⚠️ Server error while searching rides. Try again later.");
      delete userSessions[chatId];
    }
  }
}

module.exports = { initBot, sendRideAlert, sendNotification, getBot };
