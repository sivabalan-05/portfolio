"use client";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Braille Unicode Decorative Ornament:
 * Renders high-density Unicode dot-matrix patterns using the dedicated Braille font.
 * Reanimates with a brief scatter & resolve effect when entering viewport.
 */
const BRAILLE_BASE = 0x2800; // U+2800..U+28FF = 256 Braille dot patterns

export default function BrailleDeco({
  art,
  fontSize,
  opacity = 0.5,
  color = "var(--ink)",
  className,
  style,
}: {
  art: string;
  /** número = px; string pra escalar com a viewport (clamp/vw/vh) */
  fontSize: number | string;
  opacity?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLPreElement>(null);
  const [display, setDisplay] = useState(art);
  const [awake, setAwake] = useState(false);

  useEffect(() => { setDisplay(art); }, [art]);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) {
      setAwake(true);
      setDisplay(art);
      return;
    }

    let interval: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setAwake(true);

        const chars = Array.from(art);
        // só embaralha glifos "de verdade"; espaços/quebras seguram a forma
        const idx: number[] = [];
        chars.forEach((c, i) => {
          if (c !== " " && c !== "\n" && c !== "\t") idx.push(i);
        });

        let step = 0;
        const steps = 13;
        interval = setInterval(() => {
          step += 1;
          const settled = step / steps; // 0 → 1: fração já resolvida
          const out = chars.slice();
          for (const i of idx) {
            if (Math.random() > settled) {
              out[i] = String.fromCharCode(BRAILLE_BASE + ((Math.random() * 256) | 0));
            }
          }
          setDisplay(out.join(""));
          if (step >= steps) {
            clearInterval(interval);
            setDisplay(art); // garante o desenho exato no fim
          }
        }, 45);
      },
      { rootMargin: "-60px 0px" },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (interval) clearInterval(interval);
    };
  }, [art, reduceMotion]);

  return (
    <pre
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{
        fontFamily: "var(--font-braille), monospace",
        fontSize,
        lineHeight: 1,
        letterSpacing: 0,
        color,
        whiteSpace: "pre",
        userSelect: "none",
        pointerEvents: "none",
        margin: 0,
        opacity: awake ? opacity : 0,
        transform: awake ? "translateY(0)" : "translateY(22px)",
        transition: "opacity .5s ease, transform .9s cubic-bezier(.16,1,.3,1)",
        ...style,
      }}
    >
      {display}
    </pre>
  );
}
