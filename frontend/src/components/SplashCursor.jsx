import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const SplashCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Add particle on movement
      if (Math.random() > 0.5) {
        setParticles((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: e.clientX,
            y: e.clientY,
            color: ["#3b82f6", "#8b5cf6", "#06b6d4"][
              Math.floor(Math.random() * 3)
            ],
          },
        ].slice(-20)); // Keep only last 20 to avoid lag
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Main glowing cursor */}
      <motion.div
        className="absolute left-0 top-0 h-8 w-8 rounded-full mix-blend-screen"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.8) 0%, rgba(59,130,246,0) 70%)",
        }}
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5,
        }}
      />

      {/* Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute left-0 top-0 h-4 w-4 rounded-full mix-blend-screen"
            style={{
              background: `radial-gradient(circle, ${p.color} 0%, rgba(0,0,0,0) 70%)`,
            }}
            initial={{
              x: p.x - 8,
              y: p.y - 8,
              scale: 1,
              opacity: 0.8,
            }}
            animate={{
              x: p.x - 8 + (Math.random() - 0.5) * 50,
              y: p.y - 8 + (Math.random() - 0.5) * 50,
              scale: 0,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
