import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

function Navbar() {
  const { pathname } = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Search", path: "/search" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo with hover scale */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Link to="/" className="text-2xl font-bold text-primary">
            RideBuddy
          </Link>
        </motion.div>

        {/* Nav Links */}
        <div className="flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="relative text-gray-700 font-medium"
            >
              {link.name}

              {/* Animated underline */}
              {pathname === link.path && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute left-0 -bottom-1 w-full h-[2px] bg-primary rounded"
                />
              )}
            </Link>
          ))}

          {/* Login Button with hover lift */}
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/login"
              className="bg-primary px-5 py-2 rounded-lg font-semibold text-black shadow-md hover:shadow-lg transition"
            >
              Login
            </Link>
          </motion.div>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
