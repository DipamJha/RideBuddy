import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-dark border-t border-gray-200/50 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="text-3xl font-black tracking-tighter text-gradient mb-6 block">
              RideBuddy
            </Link>
            <p className="text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed mb-8">
              Changing the way the world moves. Share your journey, 
              reduce your footprint, and build meaningful connections on the road.
            </p>
            <div className="flex gap-4">
              {["𝕏", "💼", "📸", "🐙"].map((icon, i) => (
                <button key={i} className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-primary hover:text-brandDark hover:border-primary transition-all">
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Explore</h4>
            <ul className="space-y-4 text-slate-600 dark:text-slate-400 text-sm">
              <li className="hover:text-primary transition-colors"><Link to="/search">Find Rides</Link></li>
              <li className="hover:text-primary transition-colors"><Link to="/search?tab=offer">Offer a Ride</Link></li>
              <li className="hover:text-primary transition-colors">Route Planning</li>
              <li className="hover:text-primary transition-colors">Pricing</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Company</h4>
            <ul className="space-y-4 text-slate-600 dark:text-slate-400 text-sm">
              <li className="hover:text-primary transition-colors">Our Mission</li>
              <li className="hover:text-primary transition-colors">Safety</li>
              <li className="hover:text-primary transition-colors">Terms of Service</li>
              <li className="hover:text-primary transition-colors">Privacy Policy</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Support</h4>
            <ul className="space-y-4 text-slate-600 dark:text-slate-400 text-sm">
              <li className="hover:text-primary transition-colors">Help Center</li>
              <li className="hover:text-primary transition-colors">Contact Us</li>
              <li className="hover:text-primary transition-colors">Telegram Bot</li>
              <li className="hover:text-primary transition-colors">Community</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200/50 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs font-medium">
            © {new Date().getFullYear()} RideBuddy Technologies Inc. Crafted with passion for a greener Earth.
          </p>
          <div className="flex gap-8 text-xs font-bold text-slate-400">
            <span className="cursor-pointer hover:text-primary">SYSTEM STATUS</span>
            <span className="cursor-pointer hover:text-primary">COOKIE PREFERENCES</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
