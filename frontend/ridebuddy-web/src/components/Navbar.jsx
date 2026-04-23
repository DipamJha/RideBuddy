import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getUser, isLoggedIn, logout } from "../utils/api";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname, search } = location;
  const fullPath = pathname + search;

  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  // Re-check auth state on route changes
  useEffect(() => {
    setUser(isLoggedIn() ? getUser() : null);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setUser(null);
    setShowMenu(false);
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Search", path: "/search" },
    { name: "Offer Ride", path: "/search?tab=offer" },
    ...(user ? [{ name: "My Rides", path: "/my-rides" }] : []),
  ];

  const isActive = (linkPath) => {
    if (linkPath === "/search" && pathname === "/search" && !search.includes("tab=offer")) return true;
    if (linkPath === "/search?tab=offer" && fullPath.includes("/search") && search.includes("tab=offer")) return true;
    if (linkPath === "/my-rides" && pathname === "/my-rides") return true;
    if (linkPath === "/" && pathname === "/") return true;
    return false;
  };

  return (
    <nav className="glass-header">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">

        {/* Logo with hover scale */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Link to="/" className="text-3xl font-black tracking-tighter text-gradient">
            RideBuddy
          </Link>
        </motion.div>

        {/* Nav Links */}
        <div className="flex items-center gap-10">
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative font-semibold text-sm uppercase tracking-widest transition-opacity hover:opacity-100 ${
                  isActive(link.path) ? "opacity-100" : "opacity-60"
                }`}
              >
                {link.name}

                {/* Animated underline */}
                {isActive(link.path) && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-0 -bottom-2 w-full h-[3px] bg-primary rounded-full shadow-[0_0_10px_rgba(255,200,61,0.5)]"
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 border-l border-gray-200/50 dark:border-white/10 pl-8 ml-2">
            {user ? (
              /* ─── Logged-in State ─── */
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-amber-100 dark:from-primary/10 dark:to-amber-900/20 flex items-center justify-center text-lg shadow-inner border border-primary/20 overflow-hidden">
                    {user.avatar?.startsWith("http") ? (
                      <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                    ) : (
                      user.avatar || ""
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-bold leading-tight flex items-center gap-1.5">
                      {user.firstName}
                      {user.telegramChatId && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" title="Telegram Connected" />
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                      {user.telegramChatId ? "Connected" : "Member"}
                    </p>
                  </div>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${showMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute right-0 top-14 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-white/10 overflow-hidden z-50"
                  >
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-sm">{user.firstName} {user.lastName}</p>
                        {user.telegramChatId && (
                          <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">TG</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/my-rides"
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5"
                      >
                        My Rides
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"
                      >
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              /* ─── Guest State ─── */
              <>
                <Link
                  to="/login"
                  className="text-sm font-bold opacity-70 hover:opacity-100 transition-opacity"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary text-brandDark text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95"
                >
                  Join Ride
                </Link>
              </>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
