import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

/* Animation presets */
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const steps = [
  { 
    title: "Discover Nearby Rides", 
    text: "Browse verified rides heading your way. Filter by time, comfort, and cost to find your perfect match.", 
    img: "/assets/discover.png", 
    icon: "" 
  },
  { 
    title: "Book with Confidence", 
    text: "Secure your seat with one click. Enjoy instant confirmation and direct coordination via our secure chat.", 
    img: "/assets/book.png", 
    icon: "" 
  },
  { 
    title: "Enjoy Your Journey", 
    text: "Meet your buddy and ride comfortably. Save up to 60% on travel costs while making every trip social and productive.", 
    img: "/assets/ride.png", 
    icon: "" 
  },
];

function Home() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-screen grid lg:grid-cols-2">
        {/* Left Half — Text */}
        <div className="relative flex items-center justify-center px-8 md:px-16 lg:px-20 py-24 lg:py-0 z-10">
          {/* Subtle background glow */}
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl -z-10" />

          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-xl pb-16"
          >
            <motion.h1
              variants={fadeUp}
              className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6"
            >
              The Smartest Way to{" "}
              <span className="text-gradient">Travel Together.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed"
            >
              Join a community of travelers sharing rides to save costs,
              reduce traffic, and protect our environment.
              Find your ride buddy today.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Link to="/search" className="btn-primary flex items-center gap-2">
                Find a Ride
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>
              <Link to="/search?tab=offer" className="btn-secondary">
                Offer a Ride
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Half — Static Hero Image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="relative hidden lg:block"
        >
          <img
            src="/assets/hero.png"
            alt="Happy People Sharing a Ride"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent dark:from-brandDark dark:via-brandDark/20 dark:to-transparent" />
        </motion.div>
      </section>

      {/* ================= HOW IT WORKS CAROUSEL ================= */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.h2
              initial="initial"
              whileInView="animate"
              variants={fadeUp}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              How It <span className="text-gradient">Works.</span>
            </motion.h2>
          </div>

          <div className="max-w-6xl mx-auto glass-card rounded-[3rem] overflow-hidden">
            <div className="grid lg:grid-cols-2">
              {/* Image Side */}
              <div className="relative h-[400px] lg:h-full overflow-hidden bg-slate-900">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeStep}
                    src={steps[activeStep].img}
                    alt={steps[activeStep].title}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-r from-brandDark/40 to-transparent" />
              </div>

              {/* Text Side */}
              <div className="p-12 lg:p-20 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-5xl mb-8"></div>
                    <h3 className="text-4xl font-bold mb-6">{steps[activeStep].title}</h3>
                    <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10">
                      {steps[activeStep].text}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Pagination Dots */}
                <div className="flex gap-4">
                  {steps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveStep(idx)}
                      className={`h-2 transition-all duration-300 rounded-full ${
                        activeStep === idx ? "w-12 bg-primary" : "w-2 bg-slate-300 dark:bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURED COMMUTES ================= */}
      <section className="py-32 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl font-bold mb-4">Built for <span className="text-gradient">Every Road.</span></h2>
              <p className="text-slate-600 dark:text-slate-400">Wherever life takes you, we have a ride ready.</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="group relative rounded-[2rem] overflow-hidden aspect-[16/9]"
            >
              <img src="/assets/airport.png" alt="Airport Commute" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-brandDark/90 via-brandDark/20 to-transparent p-12 flex flex-col justify-end text-left">
                <span className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Fast Tracking</span>
                <h3 className="text-3xl font-bold text-white mb-4">Airport Commute</h3>
                <p className="text-gray-300 max-w-sm mb-6">Never miss a flight. Find reliable airport transfers and split the heavy fare with fellow travelers.</p>
                <Link to="/search" className="text-primary font-bold flex items-center gap-2 group/btn">
                  Explore Rides <span className="group-hover/btn:translate-x-2 transition-transform">→</span>
                </Link>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="group relative rounded-[2rem] overflow-hidden aspect-[16/9]"
            >
              <img src="/assets/office.png" alt="Office Commute" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-brandDark/90 via-brandDark/20 to-transparent p-12 flex flex-col justify-end text-left">
                <span className="text-accent font-bold uppercase tracking-widest text-sm mb-2">Daily Routine</span>
                <h3 className="text-3xl font-bold text-white mb-4">Corporate Carpool</h3>
                <p className="text-gray-300 max-w-sm mb-6">Make your daily office run productive and social. Save up to 60% on monthly fuel costs by riding together.</p>
                <Link to="/search?tab=offer" className="text-accent font-bold flex items-center gap-2 group/btn">
                  Join a Pool <span className="group-hover/btn:translate-x-2 transition-transform">→</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= STATS / IMPACT ================= */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="glass-card rounded-[3rem] p-16 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {[
              { val: "10K+", label: "Active Users" },
              { val: "₹5L+", label: "Money Saved" },
              { val: "8T", label: "CO₂ Reduced" },
              { val: "15M+", label: "Shared Kilometers" },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl md:text-5xl font-bold mb-2 text-gradient">{stat.val}</div>
                <div className="text-sm font-semibold uppercase tracking-widest opacity-60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-8">Ready to change how <br /><span className="text-gradient">you move?</span></h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Connect with verified commuters and start saving today. 
              The future of urban travel is shared.
            </p>
            <div className="flex justify-center gap-6">
              <Link to="/signup" className="btn-primary">Become a Member</Link>
              <Link to="/about" className="btn-secondary">Learn More</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Home;
