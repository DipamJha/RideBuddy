import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

function Home() {
  return (
    <div className="bg-white overflow-hidden">

      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative">
        
        {/* Glow */}
        <div className="absolute -top-40 w-[600px] h-[600px] bg-primary/20 blur-3xl rounded-full" />

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8 }}
          className="text-6xl font-bold text-gray-900"
        >
          Travel smarter with <span className="text-primary">RideBuddy</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="mt-6 text-lg text-gray-600 max-w-xl"
        >
          Share rides with people going the same way.
          Save money. Reduce traffic. Travel together.
        </motion.p>

        {/* Car */}
        <motion.div
          initial={{ x: -150 }}
          animate={{ x: 150 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="mt-12 text-6xl"
        >
          🚗
        </motion.div>

        {/* CTA */}
        <div className="mt-10 flex gap-4">
          <button className="bg-primary px-6 py-3 rounded-lg font-semibold hover:bg-primaryDark transition">
            Find a Ride
          </button>
          <button className="border px-6 py-3 rounded-lg hover:bg-gray-50 transition">
            Offer a Ride
          </button>
        </div>
      </section>
      {/* HOW IT WORKS SECTION */}
<section className="py-24 bg-gray-50">
  <div className="max-w-6xl mx-auto px-6 text-center">

    <h2 className="text-4xl font-bold mb-4">
      How <span className="text-primary">RideBuddy</span> Works
    </h2>

    <p className="text-gray-600 mb-16">
      Simple steps to travel smarter and together.
    </p>

    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ staggerChildren: 0.2 }}
      className="grid md:grid-cols-3 gap-8"
    >
      {/* Card 1 */}
      <motion.div
        variants={fadeUp}
        className="bg-white p-8 rounded-xl border hover:shadow-xl transition"
      >
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">Search Ride</h3>
        <p className="text-gray-600">
          Find people traveling to the same destination.
        </p>
      </motion.div>

      {/* Card 2 */}
      <motion.div
        variants={fadeUp}
        className="bg-white p-8 rounded-xl border hover:shadow-xl transition"
      >
        <div className="text-4xl mb-4">🤝</div>
        <h3 className="text-xl font-semibold mb-2">Join Together</h3>
        <p className="text-gray-600">
          Connect, share costs, and travel comfortably.
        </p>
      </motion.div>

      {/* Card 3 */}
      <motion.div
        variants={fadeUp}
        className="bg-white p-8 rounded-xl border hover:shadow-xl transition"
      >
        <div className="text-4xl mb-4">🚗</div>
        <h3 className="text-xl font-semibold mb-2">Ride Smart</h3>
        <p className="text-gray-600">
          Reduce traffic and enjoy a smooth journey.
        </p>
      </motion.div>
    </motion.div>

  </div>
</section>

    </div>
  );
}

export default Home;
