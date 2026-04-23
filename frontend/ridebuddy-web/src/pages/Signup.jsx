import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { authAPI, saveAuth } from "../utils/api";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [searchParams] = useSearchParams();

  // Handle Google OAuth Callback
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setLoading(true);
      localStorage.setItem("ridebuddy_token", token);
      authAPI.getMe()
        .then(data => {
          saveAuth(token, data.user);
          navigate("/search");
        })
        .catch(err => {
          setError("Google sign up failed. Please try again.");
          localStorage.removeItem("ridebuddy_token");
        })
        .finally(() => setLoading(false));
    }
  }, [searchParams, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await authAPI.signup(form);
      saveAuth(data.token, data.user);
      navigate("/search");
    } catch (err) {
      setError(err.data?.message || err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — Form */}
      <div className="flex items-center justify-center px-8 py-16">
        <motion.form
          onSubmit={handleSubmit}
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.08 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="mb-10">
            <Link to="/" className="text-3xl font-black tracking-tighter text-gradient mb-6 inline-block">
              RideBuddy
            </Link>
            <h1 className="text-3xl font-bold mb-3">Create your account</h1>
            <p className="text-slate-500 text-base">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          {/* Google Signup */}
          <motion.div variants={fadeUp} className="mb-8">
            <button
              type="button"
              onClick={() => {
                const backendUrl = window.location.hostname === "localhost" 
                  ? "http://localhost:5000" 
                  : ""; // Update for production
                window.location.href = `${backendUrl}/api/auth/google`;
              }}
              className="w-full glass-card flex items-center justify-center gap-3 py-3.5 rounded-xl hover:border-primary/30 font-medium text-sm transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </motion.div>

          {/* Divider */}
          <motion.div variants={fadeUp} className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
          </motion.div>

          {/* Form Fields */}
          <motion.div variants={fadeUp} className="space-y-5 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">First name</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-slate-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Last name</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-slate-400"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-slate-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-slate-400 pr-12"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.button
            variants={fadeUp}
            type="submit"
            disabled={loading}
            className="w-full btn-primary text-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </motion.button>

          <motion.p variants={fadeUp} className="text-xs text-center text-slate-400 mt-8 leading-relaxed">
            By creating an account, you agree to our{" "}
            <span className="text-primary cursor-pointer hover:underline">Terms</span>{" "}
            and{" "}
            <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
          </motion.p>
        </motion.form>
      </div>

      {/* Right — Image Panel */}
      <div className="hidden lg:block relative overflow-hidden">
        <img
          src="/assets/signup-bg.png"
          alt="Road trip at sunrise"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-bl from-brandDark/70 via-brandDark/40 to-primary/20" />
        <div className="absolute inset-0 flex flex-col justify-end p-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
              Start your<br />
              <span className="text-primary">journey today.</span>
            </h2>
            <p className="text-white/70 text-lg max-w-sm">
              Join thousands of commuters saving money and building meaningful connections on the road.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
