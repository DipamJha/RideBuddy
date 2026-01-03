import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

function Search() {
  const rides = [1, 2, 3];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold mb-10">Available Rides</h2>

      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.15 }}
        className="grid md:grid-cols-3 gap-6"
      >
        {rides.map((_, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="p-6 border rounded-xl hover:shadow-xl transition"
          >
            <h3 className="font-semibold text-lg">Airport Ride</h3>
            <p className="text-gray-600 mt-2">6:00 AM · 2 Seats</p>
            <button className="mt-4 bg-primary px-4 py-2 rounded-lg font-semibold">
              Join Ride
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default Search;
