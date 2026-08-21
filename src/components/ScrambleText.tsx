"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const GLYPHS = ["♡", "✦", "✧", "⋆", "░", "▒", "▓", "≈", "°", "⊹", "·", "⠂", "⠁", "✿", "₊", "˚", "✳"];
const COLORS = ["#d8b4fe", "#f472b6", "#a3e635", "#fef08a", "#99f6e4", "#1c1b18", "#5b564a"];

/*
 * A EmojiFont não possui ligaturas: cada desenho vive atrás de uma tecla
 * comum. Os atalhos continuam legíveis nas frases e são mapeados aqui para
 * uma carinha diferente em cada final.
 */
/**
 * Glifos da EmojiFont usados nos títulos. Os três rostinhos ficam como estavam;
 * os outros passaram para as versões cheias, que combinam com o peso do título.
 * A altura da tinta de cada glifo varia muito (0.56 a 1.00 do em), então o
 * corpo é compensado em globals.css para todos renderizarem no mesmo tamanho.
 */
const EMOJI_GLYPHS: Record<string, string> = {
  ":3": "j",   // rostinho
  ":)": "k",   // rostinho
  "^_^": "l",  // rostinho
  ":D": "K",   // rosa cheia — era "b", um passarinho de contorno
  ";)": "W",   // borboleta cheia — era "f", um boneco de neve
  ":P": "q",   // bichinho
  "<3": "C",   // coração cheio — era "p", que na verdade é um peixe
};

/**
 * O scramble original criava uma grade 3×3 para CADA letra do título.
 * Aqui existe apenas uma grade por linha: ela é posicionada sobre a letra
 * em hover e reutilizada. O resultado visual permanece o mesmo, com uma
 * fração do DOM e do trabalho de animação.
 */
export default function ScrambleText({ text }: { text: string }) {
  const gridRef = useRef<HTMLSpanElement>(null);
  const cellRefs = useRef<HTMLSpanElement[]>([]);
  const activeLetterRef = useRef<HTMLSpanElement | null>(null);
  const animationFrameRef = useRef(0);
  const canAnimateRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncCapability = () => {
      canAnimateRef.current = pointerQuery.matches && !motionQuery.matches;
    };

    syncCapability();
    setIsMounted(true);
    pointerQuery.addEventListener("change", syncCapability);
    motionQuery.addEventListener("change", syncCapability);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      pointerQuery.removeEventListener("change", syncCapability);
      motionQuery.removeEventListener("change", syncCapability);
    };
  }, []);

  const resetGrid = () => {
    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = 0;

    if (activeLetterRef.current) {
      activeLetterRef.current.style.opacity = "1";
      activeLetterRef.current = null;
    }

    if (gridRef.current) gridRef.current.style.opacity = "0";
  };

  const scrambleLetter = (letter: HTMLSpanElement) => {
    if (!canAnimateRef.current || activeLetterRef.current === letter) return;

    resetGrid();
    const grid = gridRef.current;
    if (!grid) return;

    const rect = letter.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    activeLetterRef.current = letter;
    letter.style.opacity = "0";
    grid.style.left = `${rect.left}px`;
    grid.style.top = `${rect.top}px`;
    grid.style.width = `${rect.width}px`;
    grid.style.height = `${rect.height}px`;
    grid.style.fontSize = `${Math.max(5, rect.height * 0.24)}px`;
    grid.style.opacity = "1";

    const drawStep = () => {
      cellRefs.current.forEach((cell) => {
        if (!cell) return;
        cell.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        cell.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        cell.style.transform = `rotate(${(Math.random() - 0.5) * 36}deg) scale(${0.85 + Math.random() * 0.4})`;
        cell.style.opacity = String(0.7 + Math.random() * 0.3);
      });
    };

    const steps = 5;
    const stepDuration = 85;
    let step = 0;
    let previousTime = performance.now();
    drawStep();

    const tick = (time: number) => {
      if (time - previousTime >= stepDuration) {
        previousTime = time;
        step += 1;

        if (step >= steps) {
          resetGrid();
          return;
        }
        drawStep();
      }
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
  };

  const parts = text.split(/(\[\[\s*[^\]]+\s*\]\]|\s+)/);

  return (
    <span className="scramble-text" aria-label={text.replace(/\[\[\s*(.+?)\s*\]\]/g, " carinha")}>
      {parts.map((part, partIndex) => {
        if (/^\s+$/.test(part)) {
          // Espaço antes de um emoji vira inquebrável: senão o glifo cai
          // sozinho na linha seguinte, longe da frase que ele fecha.
          const seguidoDeEmoji = /^\[\[\s*[^\]]+\s*\]\]$/.test(parts[partIndex + 1] ?? "");
          return (
            <span key={`space-${partIndex}`}>{seguidoDeEmoji ? " " : part}</span>
          );
        }

        const emojiMatch = part.match(/^\[\[\s*(.+?)\s*\]\]$/);
        if (emojiMatch) {
          const emojiGlyph = EMOJI_GLYPHS[emojiMatch[1].trim()] ?? "j";
          return (
            <span
              className="scramble-text__emoji"
              data-emoji={emojiMatch[1].trim()}
              aria-hidden="true"
              key={`emoji-${partIndex}`}
            >
              {emojiGlyph}
            </span>
          );
        }

        return (
          <span
            className="scramble-text__word"
            key={`word-${partIndex}`}
          >
            {Array.from(part).map((character, characterIndex) => (
              <span
                className="scramble-text__letter"
                key={`${character}-${characterIndex}`}
                onPointerEnter={(event) => scrambleLetter(event.currentTarget)}
              >
                {character}
              </span>
            ))}
          </span>
        );
      })}
      {isMounted && createPortal(
        <span
          ref={gridRef}
          className="scramble-text__grid"
          aria-hidden="true"
        >
          {Array.from({ length: 9 }).map((_, index) => (
            <span
              key={index}
              ref={(element) => {
                if (element) cellRefs.current[index] = element;
              }}
            />
          ))}
        </span>,
        document.body,
      )}
    </span>
  );
}
