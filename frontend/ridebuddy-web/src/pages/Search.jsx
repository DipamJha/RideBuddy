import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ridesAPI, alertsAPI, isLoggedIn, getUser } from "../utils/api";
import RideMap from "../components/RideMap";
import { geocodeRides } from "../utils/geocoding";

/* ─── Animations ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const popularRoutes = [
  { from: "Koramangala", to: "Airport" },
  { from: "Whitefield", to: "Majestic" },
  { from: "HSR Layout", to: "MG Road" },
  { from: "Electronic City", to: "Airport" },
];

/* ─── Star Rating Component ─── */
function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5 text-amber-400 text-sm">
      {[...Array(full)].map((_, i) => (
        <span key={i}>★</span>
      ))}
      {half && <span>☆</span>}
      <span className="text-slate-500 text-xs ml-1">{rating}</span>
    </span>
  );
}

/* ─── Amenity Badge ─── */
function AmenityBadge({ label }) {
  const icons = {
    AC: "❄️",
    Music: "🎵",
    "Pet-Friendly": "🐾",
    "Luggage Space": "🧳",
    "Charging Port": "🔌",
    "Wi-Fi": "📶",
  };
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full border border-slate-200/60 dark:border-white/10">
      {icons[label] || "✦"} {label}
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

/* ─── Helper: Format the ride for display ─── */
function formatRide(ride) {
  const driver = ride.driver || {};
  const driverName = driver.firstName
    ? `${driver.firstName} ${driver.lastName?.charAt(0) || ""}.`
    : "Unknown";
  const seatsLeft = ride.seats - (ride.seatsBooked || 0);
  const dateObj = new Date(ride.date);
  const isToday = new Date().toDateString() === dateObj.toDateString();
  const isTomorrow =
    new Date(Date.now() + 86400000).toDateString() === dateObj.toDateString();
  const dateLabel = isToday
    ? "Today"
    : isTomorrow
    ? "Tomorrow"
    : dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  return {
    ...ride,
    driverName,
    avatar: driver.avatar || "🧑",
    rating: driver.rating || 5.0,
    trips: driver.trips || 0,
    seatsLeft,
    dateLabel,
    vehicleType: ride.vehicleType || "Other",
  };
}

/* ═══════════════════════════════════════════
   MAIN SEARCH COMPONENT
   ═══════════════════════════════════════════ */
function Search() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("find");

  // Search state
  const [fromVal, setFromVal] = useState("");
  const [toVal, setToVal] = useState("");
  const [dateVal, setDateVal] = useState("");
  const [seatsVal, setSeatsVal] = useState("");
  const [rides, setRides] = useState([]);
  const [geocodedRides, setGeocodedRides] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // "list" or "map"
  const [loading, setLoading] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [error, setError] = useState("");

  // Offer ride form state
  const [offerForm, setOfferForm] = useState({
    from: "",
    to: "",
    date: "",
    time: "",
    seats: "",
    price: "",
    vehicle: "",
    amenities: [],
  });
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerSubmitted, setOfferSubmitted] = useState(false);
  const [offerError, setOfferError] = useState("");

  // Join ride state
  const [joiningId, setJoiningId] = useState(null);
  const [joinMessage, setJoinMessage] = useState("");

  // Alert (Notify Me) state
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertChatId, setAlertChatId] = useState("");
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertError, setAlertError] = useState("");

  // Sync tab from URL query param
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "offer") {
      setActiveTab("offer");
    } else {
      setActiveTab("find");
    }
  }, [searchParams]);

  // Load rides on mount
  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const data = await ridesAPI.search(params);
      const rideList = data.rides || [];
      setRides(rideList);

      // Geocode rides for the map
      if (rideList.length > 0) {
        geocodeRides(rideList).then(setGeocodedRides);
      }
    } catch (err) {
      // If backend is not running, show friendly message
      setError("Could not load rides. Make sure the backend server is running.");
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchDone(true);
    fetchRides({ from: fromVal, to: toVal, date: dateVal, seats: seatsVal });
  };

  const handleQuickRoute = (route) => {
    setFromVal(route.from);
    setToVal(route.to);
    setSearchDone(true);
    fetchRides({ from: route.from, to: route.to });
  };

  const handleJoinRide = async (rideId) => {
    if (!isLoggedIn()) {
      setJoinMessage("Please sign in to join a ride.");
      setTimeout(() => setJoinMessage(""), 3000);
      return;
    }
    setJoiningId(rideId);
    try {
      await ridesAPI.join(rideId);
      setJoinMessage("Successfully joined the ride! 🎉");
      // Refresh ride list so seat count updates
      fetchRides(
        searchDone
          ? { from: fromVal, to: toVal, date: dateVal, seats: seatsVal }
          : {}
      );
    } catch (err) {
      setJoinMessage(err.data?.message || "Failed to join ride.");
    } finally {
      setJoiningId(null);
      setTimeout(() => setJoinMessage(""), 3000);
    }
  };

  const toggleAmenity = (a) => {
    setOfferForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }));
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn()) {
      setOfferError("Please sign in to offer a ride.");
      return;
    }
    setOfferLoading(true);
    setOfferError("");
    try {
      await ridesAPI.create(offerForm);
      setOfferSubmitted(true);
      setOfferForm({
        from: "",
        to: "",
        date: "",
        time: "",
        seats: "",
        price: "",
        vehicle: "",
        amenities: [],
      });
      setTimeout(() => setOfferSubmitted(false), 3000);
    } catch (err) {
      setOfferError(err.data?.message || "Failed to publish ride.");
    } finally {
      setOfferLoading(false);
    }
  };

  const displayRides = rides.map(formatRide);

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
            className="text-center mb-10"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {activeTab === "find" ? (
                <>
                  Find Your Perfect{" "}
                  <span className="text-gradient">Ride.</span>
                </>
              ) : (
                <>
                  Share Your{" "}
                  <span className="text-gradient">Journey.</span>
                </>
              )}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mx-auto">
              {activeTab === "find"
                ? "Browse hundreds of verified rides or search by your route to find the best match."
                : "Offer your empty seats and earn while making someone's commute easier."}
            </p>
          </motion.div>

          {/* ─── Tab Switcher ─── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-1.5 border border-slate-200/60 dark:border-white/10 shadow-lg shadow-black/5">
              <button
                id="tab-find-ride"
                onClick={() => setActiveTab("find")}
                className={`relative px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                  activeTab === "find"
                    ? "bg-primary text-brandDark shadow-md shadow-primary/30"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                🔍 Find a Ride
              </button>
              <button
                id="tab-offer-ride"
                onClick={() => setActiveTab("offer")}
                className={`relative px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                  activeTab === "offer"
                    ? "bg-primary text-brandDark shadow-md shadow-primary/30"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                🚗 Offer a Ride
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Toast Message ─── */}
      <AnimatePresence>
        {joinMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-brandDark text-white px-8 py-4 rounded-2xl shadow-2xl font-semibold text-sm border border-white/10"
          >
            {joinMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Content Area ─── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === "find" ? (
            <motion.div
              key="find"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4 }}
            >
              {/* ─── Search Form Card ─── */}
              <motion.form
                onSubmit={handleSearch}
                className="glass-card rounded-3xl p-8 mb-8 shadow-xl shadow-black/5"
              >
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                  <div className="lg:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">From</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">📍</span>
                      <input id="search-from" type="text" placeholder="Pickup location" value={fromVal} onChange={(e) => setFromVal(e.target.value)} className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium placeholder:text-slate-400" />
                    </div>
                  </div>
                  <div className="lg:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">To</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🎯</span>
                      <input id="search-to" type="text" placeholder="Drop-off location" value={toVal} onChange={(e) => setToVal(e.target.value)} className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium placeholder:text-slate-400" />
                    </div>
                  </div>
                  <div className="lg:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Date</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">📅</span>
                      <input id="search-date" type="date" value={dateVal} onChange={(e) => setDateVal(e.target.value)} className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium text-slate-600 dark:text-slate-300" />
                    </div>
                  </div>
                  <div className="lg:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Seats</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">💺</span>
                      <select id="search-seats" value={seatsVal} onChange={(e) => setSeatsVal(e.target.value)} className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium text-slate-600 dark:text-slate-300 appearance-none">
                        <option value="">Any</option>
                        <option value="1">1 Seat</option>
                        <option value="2">2 Seats</option>
                        <option value="3">3+ Seats</option>
                      </select>
                    </div>
                  </div>
                  <div className="lg:col-span-1">
                    <button id="search-submit" type="submit" disabled={loading} className="w-full bg-primary hover:bg-primaryDark text-brandDark py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      {loading ? "Searching..." : "Search"}
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mr-2">Popular:</span>
                  {popularRoutes.map((route, idx) => (
                    <button key={idx} type="button" onClick={() => handleQuickRoute(route)} className="text-xs bg-slate-100 dark:bg-white/5 hover:bg-primary/20 hover:text-primary text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-white/10 font-medium">
                      {route.from} → {route.to}
                    </button>
                  ))}
                </div>
              </motion.form>

              {/* ─── Error State ─── */}
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                  <div className="text-5xl mb-4">⚠️</div>
                  <p className="text-slate-500 text-lg font-medium">{error}</p>
                  <p className="text-slate-400 text-sm mt-2">Run: <code className="bg-slate-100 dark:bg-white/5 px-2 py-1 rounded text-xs">npm run dev</code> in the backend directory</p>
                </motion.div>
              )}

              {/* ─── Loading State ─── */}
              {loading && (
                <div className="text-center py-16">
                  <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-slate-500 mt-4 font-medium">Finding rides...</p>
                </div>
              )}

              {/* ─── Empty State with Notify Me ─── */}
              {!loading && !error && displayRides.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <div className="text-6xl mb-4">🛣️</div>
                  <h3 className="text-2xl font-bold mb-2">No rides available yet</h3>
                  <p className="text-slate-500 mb-6">Be the first to offer a ride on this route!</p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                    <button onClick={() => setActiveTab("offer")} className="btn-primary text-sm">Offer a Ride</button>
                    {searchDone && isLoggedIn() && (
                      <button
                        id="notify-me-btn"
                        onClick={() => setShowAlertForm(!showAlertForm)}
                        className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest border-2 transition-all ${
                          showAlertForm
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary"
                        }`}
                      >
                        🔔 Notify Me on Telegram
                      </button>
                    )}
                    {searchDone && !isLoggedIn() && (
                      <p className="text-sm text-slate-400 mt-2">Sign in to get notified when this ride becomes available</p>
                    )}
                  </div>

                  {/* ─── Telegram Alert Form ─── */}
                  <AnimatePresence>
                    {showAlertForm && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: 15, height: 0 }}
                        className="max-w-md mx-auto"
                      >
                        <div className="glass-card rounded-2xl p-6 text-left border border-primary/20 shadow-lg shadow-primary/5">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-xl">📱</div>
                            <div>
                              <h4 className="font-bold text-sm">Get Telegram Notifications</h4>
                              <p className="text-xs text-slate-400">We'll auto-book when a ride matches!</p>
                            </div>
                          </div>

                          {alertSuccess ? (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                              <div className="text-4xl mb-2">🎉</div>
                              <p className="font-bold text-emerald-600 dark:text-emerald-400">Alert set!</p>
                              <p className="text-xs text-slate-500 mt-1">You'll be notified on Telegram when a ride for <strong>{fromVal} → {toVal}</strong> is available.</p>
                            </motion.div>
                          ) : (
                            <>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Your Telegram Chat ID</label>
                                  <input
                                    id="alert-chat-id"
                                    type="text"
                                    placeholder="e.g. 123456789"
                                    value={alertChatId}
                                    onChange={(e) => setAlertChatId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium placeholder:text-slate-400"
                                  />
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-500/5 rounded-xl p-3 border border-blue-100 dark:border-blue-500/10">
                                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">💡 How to get your Chat ID:</p>
                                  <ol className="text-xs text-blue-500/80 mt-1 space-y-0.5 list-decimal list-inside">
                                    <li>
                                      <a 
                                        href={`https://t.me/RideBuddyBot?start=${getUser()?.id}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="underline hover:text-primary font-bold"
                                      >
                                        Click here to open @RideBuddyBot
                                      </a>
                                    </li>
                                    <li>Send <code className="bg-blue-100 dark:bg-blue-500/10 px-1 rounded">/start</code></li>
                                    <li>Copy the Chat ID the bot gives you (or check if it's already auto-linked!)</li>
                                  </ol>
                                </div>
                                {alertError && (
                                  <p className="text-xs text-red-500 font-medium">{alertError}</p>
                                )}
                                <button
                                  id="set-alert-btn"
                                  onClick={async () => {
                                    if (!alertChatId.trim()) {
                                      setAlertError("Please enter your Telegram Chat ID");
                                      return;
                                    }
                                    setAlertLoading(true);
                                    setAlertError("");
                                    try {
                                      await alertsAPI.create({
                                        from: fromVal,
                                        to: toVal,
                                        date: dateVal || null,
                                        seats: seatsVal || 1,
                                        telegramChatId: alertChatId.trim(),
                                      });
                                      setAlertSuccess(true);
                                    } catch (err) {
                                      setAlertError(err.data?.message || "Failed to create alert");
                                    } finally {
                                      setAlertLoading(false);
                                    }
                                  }}
                                  disabled={alertLoading}
                                  className="w-full bg-primary hover:bg-primaryDark text-brandDark py-3 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                  {alertLoading ? "Setting Alert..." : "🔔 Set Alert"}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ─── Results ─── */}
              {!loading && !error && displayRides.length > 0 && (
                <>

                  {/* View Mode Toggle */}
                  <div className="flex justify-end mb-8">
                    <div className="inline-flex bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-1 border border-slate-200/60 dark:border-white/10 shadow-sm">
                      <button
                        onClick={() => setViewMode("list")}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                          viewMode === "list"
                            ? "bg-primary text-brandDark shadow-md"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                      >
                        List View
                      </button>
                      <button
                        onClick={() => setViewMode("map")}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                          viewMode === "map"
                            ? "bg-primary text-brandDark shadow-md"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                      >
                        Map View
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">{searchDone ? "Matching Rides" : "All Available Rides"}</h2>
                      <p className="text-sm text-slate-500 mt-1">{displayRides.length} rides found • Sorted by earliest departure</p>
                    </div>
                    <div className="flex gap-2">
                      {["Price", "Time", "Rating"].map((f) => (
                        <button key={f} className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-primary hover:text-primary text-slate-500">{f}</button>
                      ))}
                    </div>
                  </div>

                  {viewMode === "list" ? (
                    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-4">
                      {displayRides.map((ride) => (
                        <motion.div key={ride._id} variants={fadeUp} whileHover={{ y: -3 }} className="group glass-card rounded-2xl p-6 hover:shadow-2xl hover:shadow-primary/5 border border-slate-200/50 dark:border-white/5">
                          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                            {/* Driver Info */}
                            <div className="flex items-center gap-4 lg:w-56 shrink-0">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-100 dark:from-primary/10 dark:to-amber-900/20 flex items-center justify-center text-2xl shadow-inner overflow-hidden">
                                {ride.avatar?.startsWith("http") ? (
                                  <img src={ride.avatar} alt={ride.driverName} className="w-full h-full object-cover" />
                                ) : (
                                  ride.avatar || "🧑"
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-sm">{ride.driverName}</p>
                                <Stars rating={ride.rating} />
                                <p className="text-xs text-slate-400 mt-0.5">{ride.trips} trips</p>
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
                                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 px-2 text-xs text-slate-400">→</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-sm shadow-red-400/50" />
                                  {ride.to}
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-3">
                                <VehicleBadge type={ride.vehicleType} />
                                {ride.vehicle && <span className="text-xs text-slate-500 font-medium">{ride.vehicle}</span>}
                                {ride.amenities?.length > 0 && <span className="text-slate-300 dark:text-slate-600">|</span>}
                                {(ride.amenities || []).map((a) => (
                                  <AmenityBadge key={a} label={a} />
                                ))}
                              </div>
                            </div>

                            {/* Time & Price */}
                            <div className="flex lg:flex-col items-center lg:items-end gap-4 lg:gap-1 lg:w-36 shrink-0">
                              <div className="text-right">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{ride.dateLabel}</p>
                                <p className="text-lg font-bold">{ride.time}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-black text-gradient">₹{ride.price}</p>
                                <p className="text-xs text-slate-400">per seat</p>
                              </div>
                            </div>

                            {/* Action */}
                            <div className="flex lg:flex-col items-center gap-3 lg:w-40 shrink-0">
                              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${ride.seatsLeft > 0 ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10"}`}>
                                {ride.seatsLeft > 0 ? `${ride.seatsLeft} seat${ride.seatsLeft > 1 ? "s" : ""} left` : "Full"}
                              </span>
                              <button
                                id={`join-ride-${ride._id}`}
                                onClick={() => handleJoinRide(ride._id)}
                                disabled={joiningId === ride._id || ride.seatsLeft <= 0}
                                className="w-full bg-primary hover:bg-primaryDark text-brandDark px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {joiningId === ride._id ? "Joining..." : ride.seatsLeft <= 0 ? "Full" : "Join Ride"}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl relative z-10">
                      <RideMap rides={geocodedRides} />
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ) : (
            /* ═══════════════════════════════════════════
               OFFER A RIDE TAB
               ═══════════════════════════════════════════ */
            <motion.div key="offer" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }} className="max-w-3xl mx-auto">
              <motion.form onSubmit={handleOfferSubmit} className="glass-card rounded-3xl p-10 shadow-xl shadow-black/5 relative">
                {/* Success State */}
                <AnimatePresence>
                  {offerSubmitted && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute inset-0 z-20 bg-white/95 dark:bg-brandDark/95 backdrop-blur-xl rounded-3xl flex flex-col items-center justify-center">
                      <div className="text-7xl mb-6">🎉</div>
                      <h3 className="text-3xl font-bold mb-3">Ride Published!</h3>
                      <p className="text-slate-500 text-lg">Your ride is now visible to passengers.</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="text-center mb-10">
                  <div className="text-5xl mb-4">🚗</div>
                  <h2 className="text-3xl font-bold mb-2">Offer a Ride</h2>
                  <p className="text-slate-500">Fill in your trip details below. Passengers will be able to find and join your ride.</p>
                </div>

                {/* Error */}
                {offerError && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium">
                    {offerError}
                  </motion.div>
                )}

                <div className="space-y-6">
                  {/* Route Row */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Pickup Location</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">📍</span>
                        <input id="offer-from" type="text" placeholder="Where are you starting?" value={offerForm.from} onChange={(e) => setOfferForm({ ...offerForm, from: e.target.value })} className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium placeholder:text-slate-400" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Drop-off Location</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🎯</span>
                        <input id="offer-to" type="text" placeholder="Where are you going?" value={offerForm.to} onChange={(e) => setOfferForm({ ...offerForm, to: e.target.value })} className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium placeholder:text-slate-400" required />
                      </div>
                    </div>
                  </div>

                  {/* Date & Time Row */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Date</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">📅</span>
                        <input id="offer-date" type="date" value={offerForm.date} onChange={(e) => setOfferForm({ ...offerForm, date: e.target.value })} className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium text-slate-600 dark:text-slate-300" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Departure Time</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">⏰</span>
                        <input id="offer-time" type="time" value={offerForm.time} onChange={(e) => setOfferForm({ ...offerForm, time: e.target.value })} className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium text-slate-600 dark:text-slate-300" required />
                      </div>
                    </div>
                  </div>

                  {/* Seats, Price, Vehicle Row */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Available Seats</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">💺</span>
                        <select id="offer-seats" value={offerForm.seats} onChange={(e) => setOfferForm({ ...offerForm, seats: e.target.value })} className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium text-slate-600 dark:text-slate-300 appearance-none" required>
                          <option value="">Select</option>
                          <option value="1">1 Seat</option>
                          <option value="2">2 Seats</option>
                          <option value="3">3 Seats</option>
                          <option value="4">4 Seats</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Price per Seat</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">💰</span>
                        <input id="offer-price" type="number" placeholder="₹ Amount" value={offerForm.price} onChange={(e) => setOfferForm({ ...offerForm, price: e.target.value })} className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium placeholder:text-slate-400" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Vehicle</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🚙</span>
                        <input id="offer-vehicle" type="text" placeholder="e.g. Honda City" value={offerForm.vehicle} onChange={(e) => setOfferForm({ ...offerForm, vehicle: e.target.value })} className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium placeholder:text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Amenities</label>
                    <div className="flex flex-wrap gap-2">
                      {["AC", "Music", "Pet-Friendly", "Luggage Space", "Charging Port", "Wi-Fi"].map((a) => (
                        <button key={a} type="button" onClick={() => toggleAmenity(a)} className={`text-sm px-4 py-2 rounded-xl font-semibold border transition-all ${offerForm.amenities.includes(a) ? "bg-primary/20 border-primary text-primary dark:text-amber-300 shadow-sm" : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:border-primary/50"}`}>
                          {offerForm.amenities.includes(a) ? "✓ " : ""}{a}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <button id="offer-submit" type="submit" disabled={offerLoading} className="w-full bg-primary hover:bg-primaryDark text-brandDark py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-3 mt-4 disabled:opacity-60">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                    {offerLoading ? "Publishing..." : "Publish Your Ride"}
                  </button>
                </div>

                {/* Trust indicators */}
                <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-white/5 flex flex-wrap justify-center gap-6">
                  {[
                    { icon: "🛡️", text: "Verified Passengers Only" },
                    { icon: "💳", text: "Secure Payments" },
                    { icon: "📱", text: "Instant Notifications" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span className="text-base">{item.icon}</span>
                      {item.text}
                    </div>
                  ))}
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

export default Search;
