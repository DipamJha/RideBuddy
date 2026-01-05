import { motion } from "framer-motion";

/* Animation preset */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

function Search() {
  // Dummy ride data (frontend-only for now)
  const rides = [
    {
      id: 1,
      from: "Bengaluru",
      to: "Airport",
      time: "06:00 AM",
      seats: 2,
      price: 250,
    },
    {
      id: 2,
      from: "Whitefield",
      to: "Airport",
      time: "07:30 AM",
      seats: 1,
      price: 300,
    },
    {
      id: 3,
      from: "Electronic City",
      to: "Airport",
      time: "09:00 AM",
      seats: 3,
      price: 220,
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ================= FILTER BAR ================= */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5 }}
        className="bg-white sticky top-[72px] z-20 border-b"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 grid md:grid-cols-5 gap-4">

          <input
            type="text"
            placeholder="From"
            className="border px-3 py-2 rounded-md"
          />

          <input
            type="text"
            placeholder="To"
            className="border px-3 py-2 rounded-md"
          />

          <input
            type="time"
            className="border px-3 py-2 rounded-md"
          />

          <select className="border px-3 py-2 rounded-md">
            <option>Seats</option>
            <option>1</option>
            <option>2</option>
            <option>3+</option>
          </select>

          <button className="bg-primary hover:bg-primaryDark transition font-semibold rounded-md">
            Search
          </button>

        </div>
      </motion.div>

      {/* ================= RESULTS ================= */}
      <div className="max-w-7xl mx-auto px-6 py-12">

        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-3xl font-bold mb-8"
        >
          Available Rides
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.15 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {rides.map((ride) => (
            <motion.div
              key={ride.id}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl border p-6 shadow-sm hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {ride.from} → {ride.to}
                  </h3>
                  <p className="text-gray-600">{ride.time}</p>
                </div>

                <div className="text-right">
                  <p className="text-primary font-bold text-lg">
                    ₹{ride.price}
                  </p>
                  <p className="text-gray-500 text-sm">per seat</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-gray-600">
                  Seats available: <span className="font-semibold">{ride.seats}</span>
                </p>

                <button className="bg-primary px-4 py-2 rounded-md font-semibold hover:bg-primaryDark transition">
                  Join Ride
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>

    </div>
  );
}

export default Search;
