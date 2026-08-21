"use client";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * ASCII art com dois comportamentos:
 * - `frames`: troca os desenhos como um sprite.
 * - `characters`: mantém o desenho parado e transforma somente o caractere
 *   tocado, seguindo a mesma lógica tipográfica do título principal.
 */
const HOVER_GLYPHS = ["♡", "✦", "✧", "⋆", "░", "▒", "▓", "≈", "°", "⊹", "·", "✿", "₊", "˚", "✳"];

export default function AsciiAnim({
  frames,
  interval = 220,
  interaction = "frames",
  fontSize = 8,
  color = "var(--ink)",
  opacity = 0.6,
  className,
  style,
}: {
  frames: string[];
  interval?: number;
  interaction?: "frames" | "characters";
  fontSize?: number;
  color?: string;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduceMotion = useReducedMotion();
  const [i, setI] = useState(0);
  const [hoveredCharacters, setHoveredCharacters] = useState<Record<number, string>>({});
  const activeCharacters = useRef<Set<number>>(new Set());
  const characterTimers = useRef<Map<number, ReturnType<typeof setTimeout>[]>>(new Map());
  const baseFrame = frames[0] ?? "";
  const baseCharacters = useMemo(() => Array.from(baseFrame), [baseFrame]);
  const frameCharacters = useMemo(
    () => frames.map((frame) => Array.from(frame)),
    [frames],
  );

  useEffect(() => {
    if (interaction !== "frames" || frames.length <= 1 || reduceMotion) return;
    const id = setInterval(() => setI((v) => (v + 1) % frames.length), interval);
    return () => clearInterval(id);
  }, [frames.length, interaction, interval, reduceMotion]);

  useEffect(() => {
    const timers = characterTimers.current;
    const active = activeCharacters.current;
    return () => {
      timers.forEach((list) => list.forEach(clearTimeout));
      timers.clear();
      active.clear();
    };
  }, []);

  const scrambleCharacter = (index: number) => {
    const original = baseCharacters[index];
    if (
      interaction !== "characters"
      || reduceMotion
      || !original
      || original.trim() === ""
      || activeCharacters.current.has(index)
    ) return;

    activeCharacters.current.add(index);
    const candidates = frameCharacters
      .map((frame) => frame[index])
      .filter((character): character is string => Boolean(character?.trim()));
    const duration = Math.max(42, Math.min(78, interval / 4));
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let step = 0; step <= 4; step += 1) {
      const timer = setTimeout(() => {
        if (step === 4) {
          setHoveredCharacters((current) => {
            const next = { ...current };
            delete next[index];
            return next;
          });
          activeCharacters.current.delete(index);
          characterTimers.current.delete(index);
          return;
        }

        const pool = step % 2 === 0 && candidates.length ? candidates : HOVER_GLYPHS;
        const symbol = pool[Math.floor(Math.random() * pool.length)] ?? original;
        setHoveredCharacters((current) => ({ ...current, [index]: symbol }));
      }, step * duration);
      timers.push(timer);
    }

    characterTimers.current.set(index, timers);
  };

  return (
    <motion.pre
      aria-hidden="true"
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize,
        lineHeight: 1.05,
        color,
        userSelect: "none",
        pointerEvents: interaction === "characters" ? "auto" : "none",
        whiteSpace: "pre",
        margin: 0,
        ...style,
      }}
    >
      {interaction === "characters"
        ? baseCharacters.map((character, index) => (
          <Fragment key={`${index}-${character}`}>
            {character === "\n" || character === "\r"
              ? character
              : (
                <span
                  onPointerEnter={() => scrambleCharacter(index)}
                  style={{
                    display: character === " " ? "inline" : "inline-block",
                    minWidth: character === " " ? undefined : "1ch",
                    textAlign: "center",
                  }}
                >
                  {hoveredCharacters[index] ?? character}
                </span>
              )}
          </Fragment>
        ))
        : frames[i]}
    </motion.pre>
  );
}
