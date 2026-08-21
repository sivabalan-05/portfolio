"use client";
import { useEffect, useState } from "react";

/**
 * Botão "voltar ao topo" no estilo editorial do site:
 * sem bolha escura genérica — uma etiqueta sutil com borda fina,
 * fundo da página e a seta ↑ na fonte mono do site.
 */

const styles = `
  .btt {
    position: fixed;
    bottom: 1.4rem;
    right: 1.4rem;
    z-index: 900;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .38rem;
    min-height: var(--tap-min);
    padding: .45rem .7rem;
    font-family: var(--font-mono), monospace;
    font-size: var(--type-micro, .68rem);
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--ink);
    background: var(--paper);
    border: 1px solid color-mix(in srgb, var(--ink) 30%, transparent);
    cursor: pointer;
    opacity: 0;
    translate: 0 12px;
    pointer-events: none;
    transition:
      opacity .35s cubic-bezier(.16, 1, .3, 1),
      translate .35s cubic-bezier(.16, 1, .3, 1),
      background .25s ease,
      color .25s ease;
  }
  .btt[data-visible="true"] {
    opacity: 1;
    translate: 0 0;
    pointer-events: auto;
  }
  .btt:hover {
    background: var(--ink);
    color: var(--paper);
  }
  .btt:focus-visible {
    outline: 2px dotted var(--ink);
    outline-offset: 3px;
  }
`;

export default function FloatingBackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let previous = false;
    const sync = () => {
      const next = window.scrollY > window.innerHeight;
      if (next !== previous) {
        previous = next;
        setIsVisible(next);
      }
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style>{styles}</style>
      <button
        className="btt hover-trigger"
        data-visible={isVisible ? "true" : "false"}
        onClick={scrollToTop}
        aria-label="Voltar ao topo"
        tabIndex={isVisible ? 0 : -1}
      >
        ↑ topo
      </button>
    </>
  );
}
