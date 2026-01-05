import { motion } from "framer-motion";

export default function HeroRoadAnimation() {
  return (
    <div className="relative w-full h-64 mt-20 overflow-hidden">

      {/* Background fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white z-10 pointer-events-none" />

      {/* Moving SVG scene */}
      <motion.div
        className="absolute bottom-0 left-0 w-[200%] h-40"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          duration: 12,
          ease: "linear",
        }}
      >
        <svg
          viewBox="0 0 2000 200"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
        >
          {/* Sky */}
          <rect width="2000" height="200" fill="transparent" />

          {/* Trees */}
          {Array.from({ length: 20 }).map((_, i) => (
            <g key={i} transform={`translate(${i * 100}, 60)`}>
              <rect x="10" y="20" width="20" height="40" fill="#6B8E23" />
              <circle cx="20" cy="10" r="18" fill="#7FB77E" />
            </g>
          ))}

          {/* Road */}
          <rect y="140" width="2000" height="60" fill="#2E2E2E" />

          {/* Lane markings */}
          {Array.from({ length: 40 }).map((_, i) => (
            <rect
              key={i}
              x={i * 50}
              y="168"
              width="30"
              height="4"
              fill="#FACC15"
            />
          ))}
        </svg>
      </motion.div>

      {/* Static Car */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, -2, 0] }}
        transition={{ repeat: Infinity, duration: 1 }}
      >
        <div className="w-24 h-10 bg-primary rounded-lg relative shadow-lg">
          <div className="absolute -bottom-2 left-3 w-4 h-4 bg-black rounded-full" />
          <div className="absolute -bottom-2 right-3 w-4 h-4 bg-black rounded-full" />
        </div>
      </motion.div>

    </div>
  );
}
