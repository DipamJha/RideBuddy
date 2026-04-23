import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, alertsAPI, isLoggedIn, getUser, saveAuth } from "../utils/api";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [alerts, setAlerts] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    avatar: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, alertsRes] = await Promise.all([
        authAPI.getMe(),
        alertsAPI.getMy(),
      ]);
      
      setUser(userRes.user);
      setAlerts(alertsRes.alerts || []);
      setFormData({
        firstName: userRes.user.firstName,
        lastName: userRes.user.lastName || "",
        avatar: userRes.user.avatar || "",
      });
    } catch (err) {
      console.error("Fetch profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await authAPI.updateProfile(formData);
      setUser(res.user);
      // Update local storage too so Navbar updates
      saveAuth(localStorage.getItem("ridebuddy_token"), res.user);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.data?.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await alertsAPI.delete(alertId);
      setAlerts(alerts.filter((a) => a._id !== alertId));
    } catch (err) {
      console.error("Delete alert error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* ─── Hero Section ─── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="relative inline-block mb-6">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-6xl shadow-2xl border border-white/20 relative group overflow-hidden">
              {formData.avatar?.startsWith("http") ? (
                <img src={formData.avatar} alt={formData.firstName} className="w-full h-full object-cover" />
              ) : (
                formData.avatar || ""
              )}
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-xl shadow-lg border-4 border-white dark:border-brandDark cursor-pointer hover:scale-110 transition-transform">
                
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-black mb-2">
            {user.firstName} <span className="text-gradient">{user.lastName}</span>
          </h1>
          <p className="text-slate-500 font-medium">{user.email}</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
            Verified Member
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ─── Left Column: Stats & Settings ─── */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-6 rounded-3xl text-center border border-white/10">
                <div className="text-2xl mb-1"></div>
                <div className="text-2xl font-black">{user.trips || 0}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Trips</div>
              </div>
              <div className="glass-card p-6 rounded-3xl text-center border border-white/10">
                <div className="text-2xl mb-1"></div>
                <div className="text-2xl font-black">{user.rating?.toFixed(1) || "5.0"}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rating</div>
              </div>
            </div>

            {/* Telegram Card */}
            <div className="glass-card p-6 rounded-3xl border border-blue-500/10 bg-blue-500/5 relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl"></div>
                <div>
                  <h3 className="font-bold text-sm">Telegram Bot</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Automation Status</p>
                </div>
              </div>
              
              {user.telegramChatId ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Connected
                    </span>
                    <span className="text-slate-400">ID: {user.telegramChatId}</span>
                  </div>
                  <a 
                    href="https://t.me/RideBuddyBot" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-center text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                  >
                    Open Bot ↗
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Link your Telegram to get instant ride alerts and auto-book rides.
                  </p>
                  <a 
                    href={`https://t.me/RideBuddyBot?start=${user.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-center text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                  >
                    Connect Telegram
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* ─── Right Column: Profile Form & Alerts ─── */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Profile Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-8 rounded-[2rem] border border-white/10"
            >
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-sm"></span>
                Account Settings
              </h3>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">First Name</label>
                    <input 
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">Last Name</label>
                    <input 
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1 text-slate-400/50">Email Address (Read Only)</label>
                  <input 
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-slate-500 outline-none cursor-not-allowed font-medium italic"
                  />
                </div>

                <AnimatePresence>
                  {message.text && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-4 rounded-2xl text-xs font-bold ${
                        message.type === "success" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}
                    >
                      {message.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="btn-primary px-10 py-4 shadow-xl shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50"
                  >
                    {saving ? "Saving Changes..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Active Alerts */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8 rounded-[2rem] border border-white/10"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-sm"></span>
                  Active Ride Alerts
                </h3>
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {alerts.length} Active
                </span>
              </div>

              {alerts.length === 0 ? (
                <div className="text-center py-12 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10">
                  <p className="text-slate-500 text-sm italic">No active alerts. You can set them from the search page!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <motion.div 
                      key={alert._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between hover:border-primary/30 transition-all group"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-black">{alert.from}</span>
                          <span className="text-primary text-xs">→</span>
                          <span className="text-sm font-black">{alert.to}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                            {alert.date ? new Date(alert.date).toLocaleDateString() : "Any Date"}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-black uppercase tracking-tighter">
                            {alert.seats} Seat{alert.seats !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteAlert(alert._id)}
                        className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="Cancel Alert"
                      >
                        Delete
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
