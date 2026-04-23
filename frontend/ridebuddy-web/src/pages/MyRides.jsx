import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ridesAPI, reviewsAPI, isLoggedIn, getUser } from "../utils/api";

/* ─── Animations ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── Status Badge ─── */
function StatusBadge({ status }) {
  const styles = {
    active:
      "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
    completed:
      "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
    cancelled:
      "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20",
  };
  const icons = { active: "🟢", completed: "✅", cancelled: "❌" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
        styles[status] || styles.active
      }`}
    >
      {icons[status] || "🟢"} {status}
    </span>
  );
}

/* ─── Vehicle Type Badge ─── */
function VehicleBadge({ type }) {
  const colors = {
    SUV: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    Sedan: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    MPV: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
    Hatchback:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
    Other:
      "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400",
  };
  return (
    <span
      className={`text-xs font-bold px-2.5 py-0.5 rounded-lg uppercase tracking-wider ${
        colors[type] || colors["Other"]
      }`}
    >
      {type}
    </span>
  );
}

/* ─── Helper: Format date label ─── */
function formatDateLabel(dateStr) {
  const dateObj = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);

  if (today.toDateString() === dateObj.toDateString()) return "Today";
  if (tomorrow.toDateString() === dateObj.toDateString()) return "Tomorrow";

  return dateObj.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/* ─── Rating Modal ─── */
function RatingModal({ ride, isOpen, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await reviewsAPI.create({
        rideId: ride._id,
        rating,
        comment,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brandDark/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md glass-card rounded-[2.5rem] p-8 shadow-2xl border border-white/10"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⭐</div>
          <h2 className="text-2xl font-bold mb-2">Rate your driver</h2>
          <p className="text-sm text-slate-400">
            How was your journey from <strong>{ride.from}</strong> to{" "}
            <strong>{ride.to}</strong>?
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                className={`text-3xl transition-transform hover:scale-125 ${
                  s <= rating ? "grayscale-0" : "grayscale opacity-30"
                }`}
              >
                ⭐
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience..."
              className="w-full h-32 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none placeholder:text-slate-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 justify-center"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ─── Ride Card (Offered) ─── */
function OfferedRideCard({ ride }) {
  const seatsLeft = ride.seats - (ride.seatsBooked || 0);
  const passengers = ride.passengers || [];

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3 }}
      className="group glass-card rounded-2xl p-6 hover:shadow-2xl hover:shadow-primary/5 border border-slate-200/50 dark:border-white/5"
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-5">
        {/* Route Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              {ride.from}
            </div>
            <div className="flex-1 border-t-2 border-dashed border-slate-200 dark:border-white/10 relative mx-2">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 px-2 text-xs text-slate-400">
                →
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-sm shadow-red-400/50" />
              {ride.to}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <VehicleBadge type={ride.vehicleType || "Other"} />
            {ride.vehicle && (
              <span className="text-xs text-slate-500 font-medium">
                {ride.vehicle}
              </span>
            )}
            {ride.amenities?.length > 0 && (
              <span className="text-slate-300 dark:text-slate-600">|</span>
            )}
            {(ride.amenities || []).map((a) => (
              <span
                key={a}
                className="text-xs bg-slate-100 dark:bg-white/5 text-slate-500 px-2 py-0.5 rounded-full"
              >
                {a}
              </span>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-6 lg:gap-4">
          <div className="text-center lg:text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              {formatDateLabel(ride.date)}
            </p>
            <p className="text-lg font-bold">{ride.time}</p>
          </div>

          {/* Price */}
          <div className="text-center lg:text-right">
            <p className="text-2xl font-black text-gradient">₹{ride.price}</p>
            <p className="text-xs text-slate-400">per seat</p>
          </div>

          {/* Seats */}
          <div className="flex flex-col items-center gap-1">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                seatsLeft > 0
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                  : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10"
              }`}
            >
              {seatsLeft > 0
                ? `${seatsLeft}/${ride.seats} left`
                : "Full"}
            </span>
            <StatusBadge status={ride.status} />
          </div>
        </div>
      </div>

      {/* Passengers Row */}
      {passengers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Passengers ({passengers.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {passengers.map((p) => (
              <div
                key={p._id}
                className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 rounded-xl px-3 py-1.5 border border-slate-100 dark:border-white/5"
              >
                <span className="text-sm">
                  {p.avatar?.startsWith("http") ? (
                    <img src={p.avatar} alt={p.firstName} className="w-5 h-5 object-cover rounded-full inline" />
                  ) : (
                    p.avatar || "🧑"
                  )}
                </span>
                <span className="text-xs font-semibold">
                  {p.firstName} {p.lastName?.charAt(0)}.
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Ride Card (Joined) ─── */
function JoinedRideCard({ ride, onCancel }) {
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  
  const driver = ride.driver || {};
  const driverName = driver.firstName
    ? `${driver.firstName} ${driver.lastName?.charAt(0) || ""}.`
    : "Unknown";

  const handleCancelClick = async () => {
    if (!window.confirm("Are you sure you want to cancel this ride?")) return;
    setCancelLoading(true);
    try {
      await onCancel(ride._id);
    } catch (err) {
      alert(err.data?.message || err.message || "Failed to cancel ride.");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3 }}
      className="group glass-card rounded-2xl p-6 hover:shadow-2xl hover:shadow-primary/5 border border-slate-200/50 dark:border-white/5"
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-5">
        {/* Driver Info */}
        <div className="flex items-center gap-4 lg:w-52 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-100 dark:from-primary/10 dark:to-amber-900/20 flex items-center justify-center text-xl shadow-inner overflow-hidden shrink-0">
            {driver.avatar?.startsWith("http") ? (
              <img src={driver.avatar} alt={driverName} className="w-full h-full object-cover" />
            ) : (
              driver.avatar || "🧑"
            )}
          </div>
          <div>
            <p className="font-bold text-sm">{driverName}</p>
            <div className="flex items-center gap-1 text-amber-400 text-sm">
              <span>★</span>
              <span className="text-slate-500 text-xs">
                {driver.rating || 5.0} • {driver.trips || 0} trips
              </span>
            </div>
          </div>
        </div>

        {/* Route */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              {ride.from}
            </div>
            <div className="flex-1 border-t-2 border-dashed border-slate-200 dark:border-white/10 relative mx-2">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 px-2 text-xs text-slate-400">
                →
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-sm shadow-red-400/50" />
              {ride.to}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <VehicleBadge type={ride.vehicleType || "Other"} />
            {ride.vehicle && (
              <span className="text-xs text-slate-500 font-medium">
                {ride.vehicle}
              </span>
            )}
          </div>
        </div>

        {/* Date, Time, Price */}
        <div className="flex items-center gap-6 lg:gap-4">
          <div className="text-center lg:text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              {formatDateLabel(ride.date)}
            </p>
            <p className="text-lg font-bold">{ride.time}</p>
          </div>
          <div className="text-center lg:text-right">
            <p className="text-2xl font-black text-gradient">₹{ride.price}</p>
            <p className="text-xs text-slate-400">per seat</p>
          </div>
          <StatusBadge status={ride.status} />
          {ride.status === "completed" && (
            <button
              onClick={() => setIsRatingModalOpen(true)}
              className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-brandDark transition-all"
            >
              Rate Driver
            </button>
          )}
          {(ride.status === "active" || ride.status === "full") && (
            <button
              onClick={handleCancelClick}
              disabled={cancelLoading}
              className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
            >
              {cancelLoading ? "Cancelling..." : "Cancel Ride"}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isRatingModalOpen && (
          <RatingModal
            ride={ride}
            isOpen={isRatingModalOpen}
            onClose={() => setIsRatingModalOpen(false)}
            onSuccess={() => {
              // Refresh or show success toast
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN MY RIDES COMPONENT
   ═══════════════════════════════════════════ */
function MyRides() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("offered");
  const [offered, setOffered] = useState([]);
  const [joined, setJoined] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = getUser();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    fetchMyRides();
  }, []);

  const fetchMyRides = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await ridesAPI.getMyRides();
      setOffered(data.offered || []);
      setJoined(data.joined || []);
    } catch (err) {
      setError("Could not load your rides. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async (rideId) => {
    await ridesAPI.cancelRide(rideId);
    await fetchMyRides();
  };

  const totalEarnings = offered.reduce(
    (sum, r) => sum + (r.price || 0) * (r.seatsBooked || 0),
    0
  );
  const totalSpent = joined.reduce((sum, r) => sum + (r.price || 0), 0);

  const displayList = activeTab === "offered" ? offered : joined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-brandDark dark:via-slate-900 dark:to-brandDark">
      {/* ─── Hero Header ─── */}
      <section className="relative pt-28 pb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-0" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl -z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            {/* User avatar */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-amber-100 dark:from-primary/10 dark:to-amber-900/20 flex items-center justify-center text-4xl shadow-inner border-2 border-primary/20 mx-auto mb-5 overflow-hidden">
              {user?.avatar?.startsWith("http") ? (
                <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
              ) : (
                user?.avatar || "🧑"
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              My <span className="text-gradient">Rides</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Welcome back, {user?.firstName || "Rider"}! Here's your ride
              activity.
            </p>
          </motion.div>

          {/* ─── Stats Cards ─── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-3xl mx-auto"
          >
            {[
              {
                icon: "🚗",
                label: "Rides Offered",
                value: offered.length,
                color: "from-amber-500/10 to-orange-500/10",
              },
              {
                icon: "🎫",
                label: "Rides Joined",
                value: joined.length,
                color: "from-blue-500/10 to-cyan-500/10",
              },
              {
                icon: "💰",
                label: "Earnings",
                value: `₹${totalEarnings}`,
                color: "from-emerald-500/10 to-green-500/10",
              },
              {
                icon: "💳",
                label: "Spent",
                value: `₹${totalSpent}`,
                color: "from-purple-500/10 to-pink-500/10",
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.08 }}
                className={`glass-card rounded-2xl p-5 text-center bg-gradient-to-br ${stat.color} border border-slate-200/50 dark:border-white/5`}
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* ─── Tab Switcher ─── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center"
          >
            <div className="inline-flex bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-1.5 border border-slate-200/60 dark:border-white/10 shadow-lg shadow-black/5">
              <button
                id="tab-offered"
                onClick={() => setActiveTab("offered")}
                className={`relative px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                  activeTab === "offered"
                    ? "bg-primary text-brandDark shadow-md shadow-primary/30"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                🚗 Offered ({offered.length})
              </button>
              <button
                id="tab-joined"
                onClick={() => setActiveTab("joined")}
                className={`relative px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                  activeTab === "joined"
                    ? "bg-primary text-brandDark shadow-md shadow-primary/30"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                🎫 Joined ({joined.length})
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Content Area ─── */}
      <section className="max-w-7xl mx-auto px-6 pb-24 pt-6">
        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-slate-500 text-lg font-medium">{error}</p>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-slate-500 mt-4 font-medium">
              Loading your rides...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && displayList.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">
              {activeTab === "offered" ? "🛣️" : "🎫"}
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {activeTab === "offered"
                ? "No rides offered yet"
                : "No rides joined yet"}
            </h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              {activeTab === "offered"
                ? "Share your empty seats and earn while making someone's commute easier."
                : "Find a ride heading your way and save on travel costs."}
            </p>
            <button
              onClick={() =>
                navigate(
                  activeTab === "offered"
                    ? "/search?tab=offer"
                    : "/search"
                )
              }
              className="btn-primary text-sm"
            >
              {activeTab === "offered" ? "Offer a Ride" : "Find a Ride"}
            </button>
          </motion.div>
        )}

        {/* Ride Cards */}
        {!loading && !error && displayList.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="space-y-4"
            >
              {activeTab === "offered"
                ? displayList.map((ride) => (
                    <OfferedRideCard key={ride._id} ride={ride} />
                  ))
                : displayList.map((ride) => (
                    <JoinedRideCard key={ride._id} ride={ride} onCancel={handleCancelRide} />
                  ))}
            </motion.div>
          </AnimatePresence>
        )}
      </section>
    </div>
  );
}

export default MyRides;
