<div align="center">
  <!-- <img src="https://raw.githubusercontent.com/framer/motion/main/packages/framer-motion/logo.svg" alt="RideBuddy" width="120" /> -->
  <h1>RideBuddy</h1>
  <p><strong>A Real-Time, Hybrid Web & Telegram Ride-Sharing Ecosystem</strong></p>
</div>

---

**RideBuddy** reimagines the commuting experience by combining a beautifully animated, premium web dashboard with a fully automated, two-way conversational Telegram bot. Find a ride, offer a seat, get instant route alerts, and manage your trips from anywhere—all synced in real time.

## ✨ Key Features

- 🤖 **Conversational Telegram Bot:** Skip the app. Type `/offer` or `/search` to create and book rides via a smooth, conversational flow directly in your Telegram chat.
- 🔔 **Intelligent Route Alerts:** Save your frequent routes on the web dashboard. The moment a matching ride is created (either from the web or Telegram), you receive a push notification with a 1-click **Book Now** button.
- 🔒 **Secure Booking Ecosystem:**
  - Automated capacity handling: Rides instantly switch to "Full" when the last seat is taken.
  - Smart constraints: Built-in 3-hour departure protection prevents last-minute cancellations to protect drivers.
- 🎨 **Premium Glassmorphic UI:** A state-of-the-art React frontend utilizing Tailwind CSS and Framer Motion. Features a 50/50 split-screen hero layout, fluid page transitions, dynamic custom gradients, and micro-animations.
- ⭐️ **Community Trust System:** Rate drivers and view their total trips to ensure a safe and reliable community.

## 🛠️ Technology Stack

**Frontend Architecture:**
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS (Custom color palette, glassmorphism utilities)
- **Animation:** Framer Motion (Page transitions, layout animations)
- **Routing:** React Router DOM (Dynamic routing, route protection)

**Backend Architecture:**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ORM)
- **Authentication:** JSON Web Tokens (JWT) + Google OAuth integration
- **Automation:** `node-telegram-bot-api` (Polling-based state machine)

---

## 🚀 Quick Start Guide

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) and [MongoDB](https://www.mongodb.com/) installed and running. You will also need a Telegram Bot token from [BotFather](https://t.me/BotFather).

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend/ridebuddy-backend

# Install dependencies
npm install

# Create a .env file and add your credentials
# PORT=5000
# MONGODB_URI=your_mongo_connection_string
# JWT_SECRET=your_jwt_secret
# TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Start the development server
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend/ridebuddy-web

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

### 3. Connect the Telegram Bot
1. Open your browser and navigate to the frontend URL (e.g., `http://localhost:5173`).
2. Create an account.
3. Message your new Telegram bot with the `/myid` command to get your Chat ID.
4. Paste the Chat ID into your RideBuddy web profile or notification settings to instantly link your account.

---

## 🤖 Telegram Bot Commands

Once your account is linked, you can manage your rides entirely via text:
- `/offer` - Start a conversational flow to offer a new ride.
- `/search` - Find and join available rides matching your route.
- `/myrides` - View your upcoming joined rides and securely cancel them.
- `/cancel` - Abort any active conversation (like offering or searching).
- `/help` - Show the interactive help menu.

---

<div align="center">
  Built with ❤️ for a smarter, greener, and more connected commute.
</div>
