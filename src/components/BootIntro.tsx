"use client";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { GATO_FRAMES } from "./asciiArt";

/**
 * Momento de entrada (pedido dela): um ASCII (a gata dela) + barrinha de loading
 * lime que enche, ~1s, e some revelando o hero. Aparece UMA vez por sessão da aba
 * (sessionStorage), então navegar/voltar não repete. Respeita reduced-motion.
 * Frames trocados por setInterval (roda mesmo em aba oculta).
 */
const styles = `
  .boot {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    background: var(--site-paper, #0E0E0E);
    transition: opacity .45s ease;
  }
  .boot--out { opacity: 0; pointer-events: none; }
  .boot__art {
    margin: 0;
    font-family: var(--font-mono);
    font-size: clamp(7px, 2.4vw, 11px);
    line-height: 1.05;
    white-space: pre;
    color: var(--site-accent, #C8F52E);
    user-select: none;
    animation: boot-pop .5s cubic-bezier(.16,1,.3,1) both;
  }
  @keyframes boot-pop { from { opacity: 0; transform: translateY(14px) scale(.94); } to { opacity: 1; transform: none; } }
  .boot__bar {
    width: min(180px, 44vw);
    height: 6px;
    position: relative;
    overflow: hidden;
    background: repeating-linear-gradient(90deg, rgba(242,241,236,.16) 0 4px, transparent 4px 8px);
  }
  .boot__bar::after {
    content: "";
    position: absolute;
    inset: 0 100% 0 0;
    background: var(--site-accent, #C8F52E);
    animation: boot-fill 1.05s steps(22, end) forwards;
  }
  @keyframes boot-fill { to { inset: 0 0 0 0; } }
  .boot__cap {
    font-family: var(--font-body);
    font-size: .72rem;
    letter-spacing: .2em;
    text-transform: lowercase;
    color: rgba(242,241,236,.55);
  }
`;

export default function BootIntro() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<"show" | "out" | "gone">("show");
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (reduceMotion || (typeof window !== "undefined" && sessionStorage.getItem("portfolio-boot"))) {
      setPhase("gone");
      return;
    }
    const anim = setInterval(() => setFrame((v) => (v + 1) % GATO_FRAMES.length), 140);
    const t1 = setTimeout(() => setPhase("out"), 1200);
    const t2 = setTimeout(() => {
      sessionStorage.setItem("portfolio-boot", "1");
      setPhase("gone");
    }, 1680);
    return () => {
      clearInterval(anim);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reduceMotion]);

  if (phase === "gone") return null;

  return (
    <>
      <style>{styles}</style>
      <div className={`boot${phase === "out" ? " boot--out" : ""}`} aria-hidden="true">
        <pre className="boot__art">{GATO_FRAMES[frame]}</pre>
        <div className="boot__bar" />
        <div className="boot__cap">sivabalan</div>
      </div>
    </>
  );
}
