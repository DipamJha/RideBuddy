const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");
const { initBot } = require("./services/telegramBot");

const PORT = process.env.PORT || 5000;

const start = async () => {
  // Connect to MongoDB
  await connectDB();

  // Start Telegram bot (polling)
  initBot();

  // Start HTTP server
  app.listen(PORT, () => {
    console.log(`🚀 RideBuddy API running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  });
};

start();
