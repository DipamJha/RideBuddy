import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

function Footer() {
  return (
    <footer className="bg-gray-50 border-t">

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-6 py-16"
      >
        <div className="grid md:grid-cols-4 gap-12">

          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-4">
              RideBuddy
            </h3>
            <p className="text-gray-600">
              Share rides. Reduce traffic.
              <br />Travel smarter together.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="hover:text-primary transition cursor-pointer">Search Ride</li>
              <li className="hover:text-primary transition cursor-pointer">Create Ride</li>
              <li className="hover:text-primary transition cursor-pointer">How it Works</li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="hover:text-primary transition cursor-pointer">About</li>
              <li className="hover:text-primary transition cursor-pointer">Privacy</li>
              <li className="hover:text-primary transition cursor-pointer">Terms</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="hover:text-primary transition cursor-pointer">Telegram</li>
              <li className="hover:text-primary transition cursor-pointer">Email</li>
              <li className="hover:text-primary transition cursor-pointer">GitHub</li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} RideBuddy. All rights reserved.
        </div>
      </motion.div>

    </footer>
  );
}

export default Footer;
