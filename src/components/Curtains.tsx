"use client";

import React, { createContext, useCallback, useContext, useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useRichMotion } from "@/lib/performanceTier";

interface TransitionContextProps {
  transitionTo: (href: string) => void;
}

const TransitionContext = createContext<TransitionContextProps>({
  transitionTo: () => {},
});

export const usePageTransition = () => useContext(TransitionContext);

export default function Curtains() {
  // Keeping a default export placeholder to prevent any broken imports in other files
  return null;
}

type Status = "idle" | "entrance" | "exit";

// Duração total da transição (fade out de uma tela e in da próxima)
const EXIT = 650;
const ENTER = 650;

const transitionStyles = `
  .curtain-tile { background: var(--site-paper); will-change: opacity; }
  .curtain-grid[data-status="exit"] .curtain-tile {
    opacity: 0;
    animation: curtain-cover .1s linear var(--tile-delay) both;
  }
  .curtain-grid[data-status="entrance"] .curtain-tile {
    opacity: 1;
    animation: curtain-reveal .1s linear var(--tile-delay) both;
  }
  @keyframes curtain-cover { to { opacity: 1; } }
  @keyframes curtain-reveal { to { opacity: 0; } }
`;

function PixelGrid({ status, richMotion }: { status: Status; richMotion: boolean }) {
  const [grid, setGrid] = useState({ cols: 0, rows: 0 });
  const TILE_SIZE = 80; // tamanho fixo de cada bloco
  const isMoving = status !== "idle";
  const isExit = status === "exit";

  useEffect(() => {
    const calc = () => {
      setGrid({
        cols: Math.ceil(window.innerWidth / TILE_SIZE),
        rows: Math.ceil(window.innerHeight / TILE_SIZE),
      });
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  // A grade só existe durante a troca de rota. Antes, centenas de nós
  // transparentes ficavam montados durante toda a visita.
  if (!isMoving || grid.cols === 0) return null;

  const total = grid.cols * grid.rows;

  // Se o usuário pedir reduzir movimento, só dá fade no contêiner todo
  if (!richMotion) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 980,
          pointerEvents: isMoving ? "auto" : "none",
          backgroundColor: "var(--site-paper)",
          opacity: isExit ? 1 : 0,
          transition: "opacity .15s ease",
        }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="curtain-grid"
      data-status={status}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 980,
        pointerEvents: isMoving ? "auto" : "none",
        display: "grid",
        gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
        gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
      }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const x = i % grid.cols;
        const y = Math.floor(i / grid.cols);
        const maxDist = grid.cols + grid.rows - 2;
        const dist = x + y;
        
        // normaliza de 0 a 1
        const p = maxDist > 0 ? dist / maxDist : 0;
        
        // Efeito Wavefront / Diagonal sweep com 'noise' (dither):
        // Adicionando variação aleatória suaviza a "linha dura" da onda.
        const baseDelay = isExit ? p * 0.35 : (1 - p) * 0.35;
        const noise = (((i * 73) % 101) / 101) * 0.12;
        const delay = baseDelay + noise;

        return (
          <div
            key={i}
            className="curtain-tile"
            style={{ "--tile-delay": `${delay}s` } as React.CSSProperties}
          />
        );
      })}
      
      {/* Textura Global Única sobre a grade para evitar lag */}
      <div 
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='sheet'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.78' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23sheet)' opacity='.13'/%3E%3C/svg%3E\"), repeating-linear-gradient(0deg, transparent 0 17px, rgba(28,27,24,.025) 17px 18px), radial-gradient(circle at 18% 12%, rgba(255,255,255,.42), transparent 48%)",
          backgroundSize: "180px 180px, 100% 18px, 100% 100%",
          backgroundBlendMode: "multiply, multiply, normal",
          opacity: 1,
          transition: "opacity 0.4s ease",
          zIndex: 10, // above the grid pixels
        }}
      />
    </div>
  );
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const richMotion = useRichMotion();
  const [status, setStatus] = useState<Status>("idle");
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const isFirstLoad = useRef(true);
  const exitDuration = richMotion ? EXIT : 0;
  const enterDuration = richMotion ? ENTER : 0;

  // Ao trocar de rota, roda a entrada (revela o conteúdo novo) — exceto no 1º load.
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    setStatus("entrance");
    const timer = setTimeout(() => setStatus("idle"), enterDuration);
    return () => clearTimeout(timer);
  }, [pathname, enterDuration]);

  const transitionTo = useCallback((href: string) => {
    if (status === "exit" || href === pathname) return;
    setPendingHref(href);
    setStatus("exit");
  }, [pathname, status]);

  // Intercepta cliques internos globalmente.
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignora links não-roteáveis: externos, âncoras, arquivos, nova aba.
      if (
        href.startsWith("/") &&
        !href.startsWith("/#") &&
        !href.includes("#") &&
        !href.includes(".") &&
        anchor.target !== "_blank" &&
        !e.metaKey &&
        !e.ctrlKey &&
        e.button === 0
      ) {
        e.preventDefault();
        transitionTo(href);
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, [transitionTo]);

  // Quando a saída termina, troca a rota (o conteúdo já está invisível).
  useEffect(() => {
    if (status === "exit" && pendingHref) {
      const timer = setTimeout(() => {
        window.scrollTo(0, 0);
        router.push(pendingHref);
        setPendingHref(null);
      }, exitDuration);
      return () => clearTimeout(timer);
    }
  }, [status, pendingHref, router, exitDuration]);

  // O wrapper persiste entre navegações, então o cross-dissolve é contínuo.
  const wrapperStyle: React.CSSProperties = {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "var(--surface)",
  };

  return (
    <TransitionContext.Provider value={{ transitionTo }}>
      <style>{transitionStyles}</style>
      <PixelGrid status={status} richMotion={richMotion} />
      <div style={wrapperStyle}>{children}</div>
    </TransitionContext.Provider>
  );
}
