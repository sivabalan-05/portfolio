"use client";
import { useState, useRef } from "react";
import { motion, useSpring, useMotionTemplate } from "framer-motion";

export default function LiquidImage({ src, alt, objectFit = "cover", fill = true }: { src: string; alt: string; objectFit?: "cover" | "contain" | "fill", fill?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Primary spring (cursor-tight)
  const springX = useSpring(50, { stiffness: 400, damping: 40 });
  const springY = useSpring(50, { stiffness: 400, damping: 40 });

  // Trailing spring (slow, creates a soft smear/tail)
  const trailX = useSpring(50, { stiffness: 80, damping: 25 });
  const trailY = useSpring(50, { stiffness: 80, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    springX.set(x);
    springY.set(y);
    trailX.set(x);
    trailY.set(y);
  };

  const maskImage1 = useMotionTemplate`radial-gradient(ellipse 140px 110px at ${trailX}% ${trailY}%, black 0%, rgba(0,0,0,0.3) 50%, transparent 85%)`;
  const maskImage2 = useMotionTemplate`radial-gradient(circle 90px at ${springX}% ${springY}%, black 0%, rgba(0,0,0,0.5) 45%, transparent 80%)`;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        width: "100%",
        height: fill ? "100%" : "auto",
        position: "relative",
        overflow: "hidden",
        borderRadius: "inherit",
      }}
    >
      {/* Base layer (sharp, undistorted) - dictates the size of the container if fill=false */}
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: fill ? "100%" : "auto",
          display: fill ? "block" : "block", // Always block to remove inline gap
          position: fill ? "absolute" : "relative",
          top: fill ? 0 : "auto",
          left: fill ? 0 : "auto",
          objectFit: objectFit,
          pointerEvents: "none",
        }}
      />

      {/* Trailing blur smear — follows behind the cursor slowly */}
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          WebkitMaskImage: maskImage1,
          maskImage: maskImage1,
          opacity: isHovered ? 0.6 : 0,
        }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={src}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: objectFit,
            position: "absolute",
            top: 0,
            left: 0,
            filter: "blur(18px) brightness(1.1)",
            transform: "scale(1.06)",
          }}
        />
      </motion.div>

      {/* Primary blur — follows cursor directly */}
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          WebkitMaskImage: maskImage2,
          maskImage: maskImage2,
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.4 }}
      >
        {/* Blurred copy */}
        <img
          src={src}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: objectFit,
            position: "absolute",
            top: 0,
            left: 0,
            filter: "blur(10px) brightness(1.15)",
            transform: "scale(1.04)",
          }}
        />
        {/* Note: Heavy SVG noise overlay was removed for major performance gains */}
      </motion.div>
    </div>
  );
}
