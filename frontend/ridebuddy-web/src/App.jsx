import { motion } from "framer-motion";

function App() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4 overflow-hidden">

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-bold text-primary"
      >
        RideBuddy
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-4 text-lg text-gray-600"
      >
        Share the ride. Save the road.
      </motion.p>

      {/* Car animation */}
      <motion.div
        initial={{ x: -120 }}
        animate={{ x: 120 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="mt-10 text-5xl"
      >
        🚗
      </motion.div>

      {/* CTA Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="mt-10 bg-primary hover:bg-primaryDark text-black font-semibold px-8 py-3 rounded-lg shadow-md"
      >
        Search Ride
      </motion.button>

    </div>
  );
}

export default App;
