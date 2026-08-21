"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Tratamento "Barbiana Liu" (pedido dela: exatamente como a menina do
 * barbianaliu.com) aplicado às imagens de projeto:
 * - mosaico de blocos GRANDES, permanente — nunca resolve para nítido;
 * - os pixels AUMENTAM com a velocidade do mouse (mexeu rápido → mais
 *   abstrato; parou → assenta no chunky);
 * - caixa amarela de detecção com etiqueta (@projeto), com jitter de
 *   rastreamento, como visão de IA/vigilância — conexão com o TCC dela;
 * - HUD CFTV (REC / cam / relógio / cantoneiras) mantido em lime.
 * setInterval (não rAF) de propósito: continua rodando em aba oculta.
 */

const BASE_BLOCK = 16;   // chunky permanente (referência: ~19 blocos na largura)
const MAX_BLOCK = 40;    // explosão máxima com movimento rápido

const CCTV_CSS = `
  .spy { position: relative; width: 100%; height: 100%; background: #000; }
  .spy canvas { width: 100%; height: 100%; display: block; image-rendering: pixelated; }
  .spy__hud {
    position: absolute; inset: 0; pointer-events: none;
    font-family: var(--font-mono); font-size: 10px;
    text-transform: uppercase; letter-spacing: .12em; color: var(--acid);
  }
  .spy__rec { position: absolute; top: 8px; left: 10px; display: flex; align-items: center; gap: 6px; }
  .spy__dot {
    width: 8px; height: 8px; border-radius: 50%; background: #ff2222;
    animation: spy-blink 1s step-end infinite;
  }
  @keyframes spy-blink { 50% { opacity: 0; } }
  .spy__time { position: absolute; bottom: 8px; right: 10px; }
  .spy__cam { position: absolute; bottom: 8px; left: 10px; opacity: .8; }
  .spy__corner { position: absolute; width: 14px; height: 14px; border-color: var(--acid); border-style: solid; border-width: 0; }
  .spy__corner--tl { top: 4px; left: 4px; border-top-width: 1px; border-left-width: 1px; }
  .spy__corner--tr { top: 4px; right: 4px; border-top-width: 1px; border-right-width: 1px; }
  .spy__corner--bl { bottom: 4px; left: 4px; border-bottom-width: 1px; border-left-width: 1px; }
  .spy__corner--br { bottom: 4px; right: 4px; border-bottom-width: 1px; border-right-width: 1px; }
  .spy__scan {
    position: absolute; inset: 0;
    background: repeating-linear-gradient(0deg, rgba(0,0,0,.12) 0 1px, transparent 1px 3px);
    mix-blend-mode: multiply;
  }
  /* caixa de detecção amarela — exatamente como a da referência */
  .spy__track {
    position: absolute;
    border: 2px solid #FFE750;
    animation: spy-jitter 2.4s steps(2, end) infinite;
  }
  .spy__tag {
    position: absolute;
    top: -20px; left: -2px;
    background: #FFE750; color: #111;
    font-family: var(--font-mono); font-size: 9px;
    letter-spacing: .06em; text-transform: lowercase;
    padding: 3px 6px; white-space: nowrap;
  }
  @keyframes spy-jitter {
    0%   { transform: translate(0, 0); }
    25%  { transform: translate(2px, -1px); }
    50%  { transform: translate(-1px, 2px); }
    75%  { transform: translate(1px, 1px); }
    100% { transform: translate(0, 0); }
  }
`;

export default function SpyImage({
  src,
  tag,
  camLabel = "cam 01",
  width = 300,
  height = 380,
}: {
  src: string;
  tag: string;
  camLabel?: string;
  width?: number;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [time, setTime] = useState("");

  // relógio ao vivo (só no client — evita mismatch de hidratação)
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // mosaico permanente + reação à velocidade do mouse
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;

    const img = new Image();
    img.src = src;

    let block = MAX_BLOCK;        // entra estourado e assenta no chunky
    let target = BASE_BLOCK;
    let lastDrawnBlock = -1;
    let last: { x: number; y: number; t: number } | null = null;

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (last) {
        const dt = Math.max(8, now - last.t);
        const speed = Math.hypot(e.clientX - last.x, e.clientY - last.y) / dt; // px/ms
        // mexeu rápido → pixels crescem (até MAX); parar deixa decair p/ BASE
        target = Math.max(target, Math.min(MAX_BLOCK, BASE_BLOCK + speed * 14));
      }
      last = { x: e.clientX, y: e.clientY, t: now };
    };
    window.addEventListener("mousemove", onMove);

    const draw = () => {
      if (!img.complete || img.naturalWidth === 0) return;
      const b = Math.round(block);
      if (b === lastDrawnBlock) return;
      lastDrawnBlock = b;

      // recorte proporcional tipo object-fit: cover
      const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
      const sw = width / scale;
      const sh = height / scale;
      const sx = (img.naturalWidth - sw) / 2;
      const sy = (img.naturalHeight - sh) / 2;

      const cw = Math.max(1, Math.round(width / b));
      const ch = Math.max(1, Math.round(height / b));
      ctx.imageSmoothingEnabled = true;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(canvas, 0, 0, cw, ch, 0, 0, width, height);
    };

    const id = setInterval(() => {
      block += (target - block) * 0.25;        // persegue o alvo
      target += (BASE_BLOCK - target) * 0.08;  // alvo decai p/ o chunky base
      draw();
    }, 50);

    if (!img.complete) img.onload = () => { lastDrawnBlock = -1; draw(); };

    return () => {
      clearInterval(id);
      window.removeEventListener("mousemove", onMove);
      img.onload = null;
    };
  }, [src, width, height]);

  return (
    <div className="spy">
      <style>{CCTV_CSS}</style>
      <canvas ref={canvasRef} />
      <div className="spy__scan" />
      <div className="spy__hud">
        <span className="spy__rec">
          <span className="spy__dot" /> rec
        </span>
        <span className="spy__cam">{camLabel}</span>
        <span className="spy__time">{time}</span>
        <span className="spy__corner spy__corner--tl" />
        <span className="spy__corner spy__corner--tr" />
        <span className="spy__corner spy__corner--bl" />
        <span className="spy__corner spy__corner--br" />
        {/* caixa de detecção com etiqueta, estilo @designbarbiana */}
        <span className="spy__track" style={{ left: "22%", top: "26%", width: "56%", height: "42%" }}>
          <span className="spy__tag">@{tag}</span>
        </span>
      </div>
    </div>
  );
}
