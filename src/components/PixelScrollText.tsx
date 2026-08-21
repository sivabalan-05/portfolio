"use client";
import { useEffect, useRef } from "react";

/**
 * A palavra gigante do fundo revelada EXATAMENTE como as capas dos projetos:
 * desenhada num canvas e descoberta bloco a bloco conforme o scroll desce,
 * afinando até o traço limpo no fim. (Pedido dela: "faz a animação do
 * 'trabalho' igual as imagens do projeto".)
 *
 * Mesmas constantes do PixelScrollImage pra o ritmo bater.
 */

function thresholdOf(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const COLS = 22;
const SHARP_COLS = 160;
const REVEAL_END = 0.72;

export default function PixelScrollText({
  text,
  fontSize,
  color,
  className,
  style,
}: {
  text: string;
  fontSize: number;
  color: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // fonte real resolvida do token (next/font gera um nome próprio)
    const family = getComputedStyle(wrap).fontFamily || "sans-serif";
    const fill = getComputedStyle(wrap).color || color;

    // "molde" com a palavra desenhada uma vez, em resolução de tela
    const src = document.createElement("canvas");
    const sctx = src.getContext("2d");
    const off = document.createElement("canvas");
    const offCtx = off.getContext("2d");

    let ready = false;
    let raf = 0;
    let lastKey = "";
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const buildSource = () => {
      if (!sctx) return;
      const font = `${fontSize}px ${family}`;
      sctx.font = font;
      const m = sctx.measureText(text);
      const w = Math.max(1, Math.ceil(m.width));
      const h = Math.ceil(fontSize * 1.35);
      src.width = Math.ceil(w * dpr);
      src.height = Math.ceil(h * dpr);
      sctx.scale(dpr, dpr);
      sctx.font = font;
      sctx.fillStyle = fill;
      sctx.textBaseline = "middle";
      sctx.fillText(text, 0, h / 2);
      // o wrapper acompanha o tamanho do molde
      wrap.style.width = `${w}px`;
      wrap.style.height = `${h}px`;
      canvas.width = src.width;
      canvas.height = src.height;
      lastKey = "";
      ready = true;
    };

    const draw = (p: number) => {
      if (!ready || !offCtx || !canvas.width) return;
      const key = String(Math.round(p * 40));
      if (key === lastKey) return;
      lastKey = key;

      const W = canvas.width;
      const H = canvas.height;
      const aspect = H / W;
      const cols = COLS;
      const rows = Math.max(1, Math.round(cols * aspect));

      const revealP = Math.min(1, p / REVEAL_END);
      const sharpP = Math.max(0, (p - REVEAL_END) / (1 - REVEAL_END));
      const coarse = Math.max(4, Math.round(revealP < 1 ? cols : cols + (SHARP_COLS - cols) * sharpP));

      ctx.clearRect(0, 0, W, H);

      if (revealP >= 1 && coarse >= SHARP_COLS * 0.9) {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(src, 0, 0, W, H);
        return;
      }

      off.width = Math.max(1, coarse);
      off.height = Math.max(1, Math.round(coarse * aspect));
      offCtx.imageSmoothingEnabled = true;
      offCtx.clearRect(0, 0, off.width, off.height);
      offCtx.drawImage(src, 0, 0, off.width, off.height);

      ctx.imageSmoothingEnabled = false;
      if (revealP >= 1) {
        ctx.drawImage(off, 0, 0, off.width, off.height, 0, 0, W, H);
        return;
      }

      const bw = W / cols;
      const bh = H / rows;
      const ow = off.width / cols;
      const oh = off.height / rows;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (thresholdOf(y * cols + x) > revealP) continue;
          ctx.drawImage(
            off,
            x * ow, y * oh, Math.max(1, ow), Math.max(1, oh),
            Math.floor(x * bw), Math.floor(y * bh), Math.ceil(bw), Math.ceil(bh)
          );
        }
      }
    };

    const progress = () => {
      const r = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      return Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.65)));
    };

    const update = () => { raf = 0; draw(progress()); };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };

    // espera a fonte carregar, senão o molde sai na fonte de fallback
    const start = () => { buildSource(); update(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
    else start();

    window.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => { buildSource(); update(); };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [text, fontSize, color]);

  return (
    <div
      ref={wrapRef}
      className={className}
      aria-hidden="true"
      style={{ fontFamily: "var(--font-hand)", color, ...style }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block", imageRendering: "pixelated" }} />
    </div>
  );
}
