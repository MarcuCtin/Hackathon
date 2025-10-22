import { motion } from "motion/react";

export function OnboardingOrb() {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      {/* Ambient glow rings */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(125, 211, 252, 0.2) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(110, 231, 183, 0.3) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main orb */}
      <motion.div
        className="relative w-48 h-48 rounded-full"
        style={{
          background: "linear-gradient(135deg, #7dd3fc 0%, #6ee7b7 100%)",
          boxShadow: "0 20px 60px rgba(125, 211, 252, 0.4)",
        }}
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Orb highlight */}
        <div
          className="absolute top-8 left-8 w-16 h-16 rounded-full"
          style={{
            background: "radial-gradient(circle at center, rgba(255, 255, 255, 0.8) 0%, transparent 70%)",
          }}
        />
        
        {/* Inner pulse */}
        <motion.div
          className="absolute inset-4 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-sky-300 to-emerald-300"
          style={{
            left: `${30 + Math.random() * 40}%`,
            top: `${30 + Math.random() * 40}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}
