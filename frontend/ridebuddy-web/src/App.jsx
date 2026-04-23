import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Search from "./pages/Search";
import MyRides from "./pages/MyRides";
import Profile from "./pages/Profile";
import StaticPage from "./pages/StaticPage";

/* Static Page Content Data */
const staticPages = [
  {
    path: "/about",
    title: "Our Mission",
    lastUpdated: "January 1, 2026",
    sections: [
      { heading: "Who We Are", content: ["RideBuddy was founded on a simple idea: traveling together is better. We are a community-driven platform connecting empty car seats with people looking for a ride."] },
      { heading: "Our Vision", content: ["We envision a world with zero empty seats. By sharing rides, we can drastically reduce our carbon footprint, alleviate traffic congestion, and create a more sustainable future for urban mobility."] }
    ]
  },
  {
    path: "/safety",
    title: "Safety First",
    lastUpdated: "February 15, 2026",
    sections: [
      { heading: "Verified Members", content: ["Every user on RideBuddy undergoes a verification process. We verify emails and monitor ratings to ensure our community remains trustworthy."] },
      { heading: "Secure Communication", content: ["Your privacy is important to us. We use Telegram bot integration so you can communicate securely without ever exposing your personal phone number."] }
    ]
  },
  {
    path: "/terms",
    title: "Terms of Service",
    lastUpdated: "March 10, 2026",
    sections: [
      { heading: "Acceptance of Terms", content: ["By accessing and using RideBuddy, you accept and agree to be bound by the terms and provisions of this agreement."] },
      { heading: "User Responsibilities", content: ["Users agree to provide accurate information and maintain the security of their accounts. Any illegal activity or harassment will result in immediate termination."] }
    ]
  },
  {
    path: "/privacy",
    title: "Privacy Policy",
    lastUpdated: "April 5, 2026",
    sections: [
      { heading: "Data Collection", content: ["We collect personal data to provide our services. This includes your name, email, and location data when searching for rides."] },
      { heading: "Data Sharing", content: ["We do not sell your personal data to third parties. We only share necessary trip information between matched drivers and passengers."] }
    ]
  },
  {
    path: "/help",
    title: "Help Center",
    lastUpdated: "April 20, 2026",
    sections: [
      { heading: "How to book a ride?", content: ["Navigate to the Search page, enter your route, and browse the available rides. Click 'Join Ride' to secure your seat instantly!"] },
      { heading: "How do I offer a ride?", content: ["Switch to the 'Offer a Ride' tab on the Search page, fill out your trip details including time, price, and available seats, then submit."] }
    ]
  },
  {
    path: "/contact",
    title: "Contact Us",
    lastUpdated: "April 21, 2026",
    sections: [
      { heading: "Get in Touch", content: ["Have questions, feedback, or need support? We're here to help!"] },
      { heading: "Email Support", content: ["Drop us an email at support@ridebuddy.com. We aim to respond within 24 hours."] },
      { heading: "Community Slack", content: ["Join our community Slack channel to chat with our team and other RideBuddy members directly!"] }
    ]
  },
  {
    path: "/route-planning",
    title: "Route Planning",
    lastUpdated: "April 21, 2026",
    sections: [
      { heading: "Intelligent Routing", content: ["We utilize advanced routing algorithms combined with real-time mapping via Leaflet.js to find the most optimal path for your journey."] },
      { heading: "Real-time adjustments", content: ["Our system dynamically adjusts ETAs and suggests meeting points to make pickups and drop-offs as seamless as possible."] }
    ]
  },
  {
    path: "/pricing",
    title: "Fair Pricing",
    lastUpdated: "April 21, 2026",
    sections: [
      { heading: "Cost Sharing", content: ["RideBuddy is built on the principle of cost-sharing, not profit-making. Prices are capped per seat to reflect fair fuel and maintenance contributions."] },
      { heading: "No Hidden Fees", content: ["What you see is what you pay. We don't charge exorbitant booking fees like traditional cab aggregators."] }
    ]
  },
  {
    path: "/community",
    title: "Community",
    lastUpdated: "April 21, 2026",
    sections: [
      { heading: "Join the Movement", content: ["RideBuddy isn't just an app; it's a movement towards smarter, greener, and more social travel. Join our forums and events!"] },
      { heading: "Driver Rewards", content: ["Top-rated drivers are rewarded monthly with badges, priority listing, and exclusive perks from our eco-friendly partners."] }
    ]
  }
];

/* Page transition animation */
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.6 }}
            >
              <Home />
            </motion.div>
          }
        />

        <Route
          path="/search"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Search />
            </motion.div>
          }
        />

        <Route
          path="/login"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Login />
            </motion.div>
          }
        />

        <Route
          path="/signup"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Signup />
            </motion.div>
          }
        />

        <Route
          path="/my-rides"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <MyRides />
            </motion.div>
          }
        />

        <Route
          path="/profile"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Profile />
            </motion.div>
          }
        />
        {/* Static Pages Mapping */}
        {staticPages.map((page) => (
          <Route
            key={page.path}
            path={page.path}
            element={
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <StaticPage
                  title={page.title}
                  lastUpdated={page.lastUpdated}
                  sections={page.sections}
                />
              </motion.div>
            }
          />
        ))}
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AnimatedRoutes />
      <Footer />
    </BrowserRouter>
  );
}

export default App;
