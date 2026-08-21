"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type InkDot = {
  x: number;
  y: number;
  symbol: string;
  size: number;
  rotation: number;
  spin: number;
  life: number;
  maxLife: number;
  color: string;
  glow: string;
  vx: number;
  vy: number;
};

/* Paleta monocromática, casada com a identidade atual (bege + tinta escura).
 * Antes era o neon Y2K rosa/lilás da id velha — era ele que dava o "brilho
 * artificial". Agora: tinta escura dominante + cinzas quentes + faísca de creme
 * ocasional, e o glow é translúcido e baixo (sombra de tinta, não neon). */
const INKS = [
  { color: "#1c1b18", glow: "rgba(28,27,24,.30)" },
  { color: "#1c1b18", glow: "rgba(28,27,24,.24)" },
  { color: "#3a372f", glow: "rgba(28,27,24,.20)" },
  { color: "#5b564a", glow: "rgba(28,27,24,.16)" },
  { color: "#f6f1e6", glow: "rgba(255,255,255,.34)" },
  { color: "#ffffff", glow: "rgba(255,255,255,.40)" },
] as const;
/* só as fofinhas — saíram as matemáticas (∑ √ π ≠ ∞ ×) que pareciam terminal */
const SYMBOLS = ["✦", "✧", "⋆", "✳", "·", "°", "♡", "⊹", "+"];
const MOTION_FAST = 0.2;
const MOTION_EASE_STANDARD = [0, 0, 0.2, 1] as const;
const TRAIL_SPACING = 10;
const MAX_TRAIL_STEPS = 8;
const MAX_TRAIL_DOTS = 96;

export default function Cursor() {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [cursorLabel, setCursorLabel] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dots = useRef<InkDot[]>([]);
  const startTrail = useRef<() => void>(() => undefined);
  const lastTrailPos = useRef({ x: -9999, y: -9999 });
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);
    let frame = 0;
    let lastTime = performance.now();

    const render = (time: number) => {
      frame = 0;
      const dt = Math.min(2.5, (time - lastTime) / 16.666); 
      lastTime = time;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.globalCompositeOperation = "source-over";

      const totalDots = dots.current.length;
      const useShadow = totalDots <= 24;

      for (let index = totalDots - 1; index >= 0; index -= 1) {
        const dot = dots.current[index];
        dot.x += dot.vx * dt;
        dot.y += dot.vy * dt;
        dot.rotation += dot.spin * dt;
        dot.life -= 1 * dt;

        if (dot.life <= 0) {
          dots.current.splice(index, 1);
          continue;
        }

        const progress = dot.life / dot.maxLife;
        ctx.save();
        ctx.translate(dot.x, dot.y);
        ctx.rotate(dot.rotation);
        ctx.globalAlpha = Math.min(1, progress * 1.35) * 0.7;
        ctx.fillStyle = dot.color;
        if (useShadow) {
          ctx.shadowColor = dot.glow;
          ctx.shadowBlur = 3 * progress;
        }
        ctx.font = `700 ${Math.max(7, dot.size * (0.72 + progress * 0.28))}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(dot.symbol, 0, 0);
        ctx.restore();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      if (dots.current.length) frame = requestAnimationFrame(render);
    };

    startTrail.current = () => {
      if (!frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(render);
      }
    };
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
      startTrail.current = () => undefined;
    };
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    if (!finePointer.matches) return;

    const handleMove = (event: MouseEvent) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);

      const x = event.clientX;
      const y = event.clientY;
      if (lastTrailPos.current.x === -9999) {
        lastTrailPos.current = { x, y };
        return;
      }

      if (reduceMotion) {
        lastTrailPos.current = { x, y };
        return;
      }

      const dx = x - lastTrailPos.current.x;
      const dy = y - lastTrailPos.current.y;
      const distance = Math.hypot(dx, dy);

      // Mede desde a última emissão, não desde o último evento. Assim mouses
      // de polling alto também formam um traço contínuo sem criar partículas
      // demais por frame.
      if (finePointer.matches && distance >= TRAIL_SPACING) {
        const steps = Math.min(
          MAX_TRAIL_STEPS,
          Math.max(1, Math.floor(distance / TRAIL_SPACING)),
        );
        for (let index = 0; index < steps; index += 1) {
          const t = (index + 1) / steps;
          const maxLife = 26 + Math.random() * 12;
          const ink = INKS[Math.floor(Math.random() * INKS.length)];
          dots.current.push({
            x: lastTrailPos.current.x + dx * t + (Math.random() - 0.5) * 3,
            y: lastTrailPos.current.y + dy * t + (Math.random() - 0.5) * 3,
            symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            size: 9 + Math.random() * 6,
            rotation: (Math.random() - 0.5) * 0.7,
            spin: (Math.random() - 0.5) * 0.025,
            life: maxLife,
            maxLife,
            color: ink.color,
            glow: ink.glow,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -0.04 - Math.random() * 0.2,
          });
        }
        if (dots.current.length > MAX_TRAIL_DOTS) {
          dots.current.splice(0, dots.current.length - MAX_TRAIL_DOTS);
        }
        lastTrailPos.current = { x, y };
        startTrail.current();
      }
    };

    const resetTrailOrigin = () => {
      lastTrailPos.current = { x: -9999, y: -9999 };
    };

    const handleOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const labelTarget = target.closest<HTMLElement>("[data-cursor-label]");
      setCursorLabel(labelTarget?.dataset.cursorLabel ?? "");
      setHovered(Boolean(target.closest("a, button, .hover-trigger")));
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseover", handleOver);
    document.documentElement.addEventListener("mouseleave", resetTrailOrigin);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseover", handleOver);
      document.documentElement.removeEventListener("mouseleave", resetTrailOrigin);
    };
  }, [cursorX, cursorY, reduceMotion]);

  return (
    <>
      <style>{`
        @media (pointer: fine) {
          html, body, a, button, .hover-trigger { cursor: none !important; }
          html[data-stamp-mode="true"] [data-ink-cursor] { display: none !important; }
          html[data-stamp-mode="true"] [data-ink-trail] { opacity: .12; }
        }
        @media (pointer: coarse) {
          [data-ink-cursor], [data-ink-trail] { display: none !important; }
        }
      `}</style>
      <canvas
        ref={canvasRef}
        data-ink-trail
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}
      />
      <motion.div
        data-ink-cursor
        aria-hidden="true"
        style={{ position: "fixed", left: 0, top: 0, x: cursorX, y: cursorY, pointerEvents: "none", zIndex: 10000 }}
      >
        <motion.span
          animate={{
            x: -7,
            y: -10,
            scale: hovered ? 1.18 : 1,
            rotate: hovered ? -8 : 0,
          }}
          transition={{ duration: MOTION_FAST, ease: MOTION_EASE_STANDARD }}
          style={{
            position: "absolute",
            display: "block",
            color: "var(--site-ink)",
            fontFamily: "\"Segoe UI Symbol\", var(--font-mono), monospace",
            fontSize: hovered ? "1rem" : ".9rem",
            fontWeight: 700,
            lineHeight: 1,
            whiteSpace: "nowrap",
            fontVariantEmoji: "text",
            textShadow: "0 1px 0 var(--site-paper)",
          }}
        >
          {hovered ? (cursorLabel ? "" : "↗") : "✳︎"}
        </motion.span>
        <AnimatePresence>
          {cursorLabel && (
            <motion.span
              initial={reduceMotion ? false : { opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 23 }}
              exit={{ opacity: 0, x: 18 }}
              transition={{ duration: MOTION_FAST, ease: MOTION_EASE_STANDARD }}
              style={{
                position: "absolute",
                top: 12,
                left: 0,
                padding: ".28rem .5rem",
                borderBottom: "1px solid color-mix(in srgb, var(--site-ink) 42%, transparent)",
                background: "color-mix(in srgb, var(--site-paper) 88%, transparent)",
                color: "var(--site-ink)",
                fontFamily: "var(--font-mono), monospace",
                fontSize: ".68rem",
                letterSpacing: ".08em",
                whiteSpace: "nowrap",
              }}
            >
              {cursorLabel}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
