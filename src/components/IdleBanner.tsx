"use client";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  GATO_FRAMES,
  GATO_PRETO_FRAMES,
  FLOR,
  ESTRELA,
  BORBOLETA_FRAMES,
} from "./asciiArt";

/**
 * Banner ASCII grande e discreto no header (pedido dela). LEVE de propósito:
 * NÃO roda loop de animação — só troca de cena quando o mouse PAUSA (idle),
 * e a troca é um scramble curtinho (setInterval que morre em ~0.3s). Fora isso
 * fica parado. É texto, não canvas. Fundo faint, atrás do conteúdo do hero.
 */
const SCRAMBLE = "░▒▓$#*+=~:.";
const HOVER_GLYPHS = ["♡", "✦", "✧", "⋆", "░", "▒", "▓", "≈", "°", "⊹", "·", "✿", "₊", "˚", "✳"];
const ASCII_SCENES = [
  GATO_FRAMES[0],
  BORBOLETA_FRAMES[0],
  FLOR[0],
  GATO_PRETO_FRAMES[0],
  ESTRELA[0],
] as const;

function InteractiveAscii({ text, reduceMotion }: { text: string; reduceMotion: boolean }) {
  const characters = useMemo(() => Array.from(text), [text]);
  const active = useRef<Map<number, {
    node: HTMLSpanElement;
    original: string;
    startedAt: number;
    phase: number;
  }>>(new Map());
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    const activeCharacters = active.current;

    return () => {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
      activeCharacters.forEach((entry) => {
        entry.node.textContent = entry.original;
        entry.node.dataset.active = "false";
      });
      activeCharacters.clear();
    };
  }, [text]);

  const animateMutations = () => {
    if (animationFrame.current !== null) return;

    const tick = (now: number) => {
      active.current.forEach((entry, index) => {
        const elapsed = now - entry.startedAt;

        if (elapsed >= 290) {
          entry.node.textContent = entry.original;
          entry.node.dataset.active = "false";
          active.current.delete(index);
          return;
        }

        const phase = Math.floor(elapsed / 58);
        if (phase === entry.phase) return;

        entry.phase = phase;
        entry.node.textContent = HOVER_GLYPHS[
          Math.floor(Math.random() * HOVER_GLYPHS.length)
        ] ?? entry.original;
      });

      if (active.current.size > 0) {
        animationFrame.current = requestAnimationFrame(tick);
      } else {
        animationFrame.current = null;
      }
    };

    animationFrame.current = requestAnimationFrame(tick);
  };

  const mutateArea = (
    center: number,
    startedAt: number,
    container: HTMLElement | null,
  ) => {
    if (reduceMotion || !container) return;

    [-2, -1, 0, 1, 2].forEach((offset) => {
      const index = center + offset;
      const original = characters[index];
      const node = container.querySelector<HTMLSpanElement>(
        `[data-ascii-index="${index}"]`,
      );

      if (!node || !original || original.trim() === "") return;

      active.current.set(index, { node, original, startedAt, phase: -1 });
      node.dataset.active = "true";
    });
    animateMutations();
  };

  return characters.map((character, index) => (
    <Fragment key={index}>
      {character === "\n" || character === "\r"
        ? character
        : (
          <span
            className="rm-idle__char"
            data-ascii-index={index}
            data-active="false"
            onPointerEnter={(event) => {
              mutateArea(index, event.timeStamp, event.currentTarget.parentElement);
            }}
          >
            {character}
          </span>
        )}
    </Fragment>
  ));
}

export default function IdleBanner() {
  const reduceMotion = useReducedMotion();
  const [scene, setScene] = useState(0);
  const [display, setDisplay] = useState(GATO_FRAMES[0]);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrambleTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // troca de cena SÓ quando o mouse para por um tempinho
  useEffect(() => {
    if (reduceMotion) return;
    function arm() {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setScene((current) => (current + 1) % ASCII_SCENES.length);
        arm();
      }, 5000);
    }
    window.addEventListener("mousemove", arm, { passive: true });
    arm();
    return () => {
      window.removeEventListener("mousemove", arm);
      clearTimeout(idleTimer.current);
    };
  }, [reduceMotion]);

  // transição: scramble curto que resolve na cena nova
  useEffect(() => {
    const target = ASCII_SCENES[scene % ASCII_SCENES.length];
    if (reduceMotion) {
      const timer = setTimeout(() => setDisplay(target), 0);
      return () => clearTimeout(timer);
    }
    const chars = Array.from(target);
    const idx: number[] = [];
    chars.forEach((c, i) => {
      if (c !== " " && c !== "\n" && c !== "\t") idx.push(i);
    });
    let step = 0;
    const steps = 8;
    clearInterval(scrambleTimer.current);
    scrambleTimer.current = setInterval(() => {
      step += 1;
      const p = step / steps;
      const out = chars.slice();
      for (const i of idx) {
        if (Math.random() > p) out[i] = SCRAMBLE.charAt((Math.random() * SCRAMBLE.length) | 0);
      }
      setDisplay(out.join(""));
      if (step >= steps) {
        clearInterval(scrambleTimer.current);
        setDisplay(target);
      }
    }, 42);
    return () => clearInterval(scrambleTimer.current);
  }, [scene, reduceMotion]);

  return (
    <pre className="rm-idle" aria-hidden="true">
      <InteractiveAscii
        key={scene}
        text={display}
        reduceMotion={Boolean(reduceMotion)}
      />
    </pre>
  );
}
