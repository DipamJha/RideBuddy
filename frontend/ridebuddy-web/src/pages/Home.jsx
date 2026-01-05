import { motion } from "framer-motion";

/* Animation preset */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

function Home() {
  return (
   <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">


      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">

        {/* Yellow Glow Effect */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                     w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl -z-10"
        />

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-6xl font-bold text-gray-900"
        >
          Travel smarter with{" "}
          <span className="text-primary">RideBuddy</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mt-6 text-lg text-gray-600 max-w-xl"
        >
          Share rides with people going the same way.
          Save money. Reduce traffic. Travel together.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex gap-4"
        >
          <button className="bg-primary px-6 py-3 rounded-lg font-semibold hover:bg-primaryDark transition">
            Find a Ride
          </button>
          <button className="border px-6 py-3 rounded-lg hover:bg-gray-50 transition">
            Offer a Ride
          </button>
        </motion.div>

      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-4xl font-bold mb-4"
          >
            How <span className="text-primary">RideBuddy</span> Works
          </motion.h2>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 mb-16"
          >
            Simple steps to travel smarter and together.
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.2 }}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div
              variants={fadeUp}
              className="bg-white p-8 rounded-xl border hover:shadow-lg transition"
            >
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Search Ride</h3>
              <p className="text-gray-600">
                Find people travelling to the same destination.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="bg-white p-8 rounded-xl border hover:shadow-lg transition"
            >
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2">Join Together</h3>
              <p className="text-gray-600">
                Connect, split costs, and ride comfortably.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="bg-white p-8 rounded-xl border hover:shadow-lg transition"
            >
              <div className="text-3xl mb-4">🚗</div>
              <h3 className="text-xl font-semibold mb-2">Travel Smart</h3>
              <p className="text-gray-600">
                Reduce traffic and enjoy a smooth journey.
              </p>
            </motion.div>
          </motion.div>

        </div>
      </section>
      {/* ================= PROBLEM / SOLUTION ================= */}
<section className="py-28">
  <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

    {/* Image */}
    <motion.img
      src="https://images.unsplash.com/photo-1503376780353-7e6692767b70"
      alt="Traffic congestion"
      initial={{ opacity: 0, x: -60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="rounded-2xl shadow-lg"
    />

    {/* Text */}
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-4xl font-bold mb-6">
        Too many cars. <br />
        <span className="text-primary">Too little connection.</span>
      </h2>

      <p className="text-gray-600 text-lg mb-6">
        Every day, thousands of people travel alone to the same destinations.
        RideBuddy helps you share rides, reduce traffic, and travel smarter.
      </p>

      <p className="text-gray-600">
        Less congestion. Lower cost. Better journeys.
      </p>
    </motion.div>

  </div>
</section>
{/* ================= USE CASES ================= */}
<section className="py-28 bg-gray-50">
  <div className="max-w-7xl mx-auto px-6 text-center">

    <motion.h2
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-4xl font-bold mb-4"
    >
      Built for real journeys
    </motion.h2>

    <motion.p
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="text-gray-600 mb-16"
    >
      Wherever you're going, RideBuddy fits your travel.
    </motion.p>

    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ staggerChildren: 0.2 }}
      className="grid md:grid-cols-3 gap-8"
    >
      {[
        {
          title: "Airport Rides",
          img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
          text: "Find companions heading to the same airport and save costs."
        },
        {
          title: "Office Commute",
          img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
          text: "Daily rides to office made simpler and greener."
        },
        {
          title: "Events & Trips",
          img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
          text: "Concerts, weddings, trips — travel together."
        },
      ].map((item, i) => (
        <motion.div
          key={i}
          variants={fadeUp}
          className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition"
        >
          <img src={item.img} alt={item.title} className="h-48 w-full object-cover" />
          <div className="p-6 text-left">
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.text}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>

  </div>
</section>
{/* ================= IMPACT / STATS ================= */}
<section className="py-28">
  <div className="max-w-7xl mx-auto px-6 text-center">

    <motion.h2
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="text-4xl font-bold mb-4"
    >
      Real impact, <span className="text-primary">real change</span>
    </motion.h2>

    <motion.p
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="text-gray-600 mb-20 max-w-2xl mx-auto"
    >
      RideBuddy isn’t just about rides. It’s about reducing traffic,
      saving money, and building smarter travel habits.
    </motion.p>

    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ staggerChildren: 0.2 }}
      className="grid md:grid-cols-4 gap-10"
    >
      {/* Stat 1 */}
      <motion.div
        variants={fadeUp}
        className="p-8 rounded-xl border bg-white hover:shadow-lg transition"
      >
        <div className="text-4xl font-bold text-primary mb-2">10K+</div>
        <p className="text-gray-600">Rides Shared</p>
      </motion.div>

      {/* Stat 2 */}
      <motion.div
        variants={fadeUp}
        className="p-8 rounded-xl border bg-white hover:shadow-lg transition"
      >
        <div className="text-4xl font-bold text-primary mb-2">25%</div>
        <p className="text-gray-600">Traffic Reduced</p>
      </motion.div>

      {/* Stat 3 */}
      <motion.div
        variants={fadeUp}
        className="p-8 rounded-xl border bg-white hover:shadow-lg transition"
      >
        <div className="text-4xl font-bold text-primary mb-2">₹5L+</div>
        <p className="text-gray-600">Money Saved</p>
      </motion.div>

      {/* Stat 4 */}
      <motion.div
        variants={fadeUp}
        className="p-8 rounded-xl border bg-white hover:shadow-lg transition"
      >
        <div className="text-4xl font-bold text-primary mb-2">8T</div>
        <p className="text-gray-600">CO₂ Reduced</p>
      </motion.div>
    </motion.div>

  </div>
</section>


      {/* ================= CTA SECTION ================= */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">

          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-4xl font-bold mb-6"
          >
            Ready to ride smarter?
          </motion.h2>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 mb-10"
          >
            Join RideBuddy today and make every trip efficient.
          </motion.p>

          <motion.button
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-primary px-8 py-4 rounded-lg font-semibold hover:bg-primaryDark transition"
          >
            Get Started
          </motion.button>

        </div>
      </section>

    </div>
  );
}

export default Home;
