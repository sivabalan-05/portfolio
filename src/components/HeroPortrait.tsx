"use client";

import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface HeroPortraitProps {
  src?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function HeroPortrait({
  src = "/img/IMG_6379.png",
  className = "",
  style,
}: HeroPortraitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processedImgCanvas = useRef<HTMLCanvasElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Mouse velocity tracking for interactive mosaic effect
  const mouseVelocity = useRef(0);
  const lastMousePos = useRef({ x: 0, y: 0, time: 0 });
  const blockFactor = useRef(1);

  // Parallax 3D tilt
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Load and chroma-key image to make white background 100% transparent
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      // Create an offscreen canvas to remove white background
      const offscreen = document.createElement("canvas");
      offscreen.width = img.naturalWidth || img.width;
      offscreen.height = img.naturalHeight || img.height;
      const ctx = offscreen.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
      const data = imgData.data;

      // Key out near-white background pixels for seamless blend
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // If pixel is white / near white background
        if (r > 238 && g > 238 && b > 238) {
          // Smooth alpha falloff near edges
          const brightness = (r + g + b) / 3;
          if (brightness > 248) {
            data[i + 3] = 0; // completely transparent
          } else {
            const alpha = Math.max(0, 255 - (brightness - 238) * 25.5);
            data[i + 3] = Math.min(data[i + 3], alpha);
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      processedImgCanvas.current = offscreen;
      setIsLoaded(true);
    };
  }, [src]);

  // Main Canvas Render Loop (Clean Cutout + Interactive Mosaic Dynamics)
  useEffect(() => {
    if (!isLoaded || !canvasRef.current || !containerRef.current || !processedImgCanvas.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sourceCanvas = processedImgCanvas.current;
    let animationFrameId: number;

    const render = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const width = Math.round(rect.width * dpr);
      const height = Math.round(rect.height * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth decay for blockFactor
      const targetFactor = isHovered ? 2.5 : Math.max(1, 1 + mouseVelocity.current * 0.04);
      blockFactor.current += (targetFactor - blockFactor.current) * 0.12;
      mouseVelocity.current *= 0.88;

      const currentBlock = Math.round(blockFactor.current);

      if (currentBlock <= 1 || prefersReducedMotion) {
        // Draw crystal-clear cutout image
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(sourceCanvas, 0, 0, width, height);
      } else {
        // Draw pixelated mosaic effect
        ctx.imageSmoothingEnabled = false;
        const scaledW = Math.max(12, Math.floor(width / (currentBlock * 3.2)));
        const scaledH = Math.max(12, Math.floor(height / (currentBlock * 3.2)));

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = scaledW;
        tempCanvas.height = scaledH;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.imageSmoothingEnabled = false;
          tempCtx.drawImage(sourceCanvas, 0, 0, scaledW, scaledH);
          ctx.drawImage(tempCanvas, 0, 0, scaledW, scaledH, 0, 0, width, height);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isLoaded, isHovered, prefersReducedMotion]);

  // Track pointer movements for subtle 3D tilt & velocity
  const handlePointerMove = (e: React.PointerEvent) => {
    const now = performance.now();
    const dt = Math.max(1, now - lastMousePos.current.time);
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    const speed = Math.sqrt(dx * dx + dy * dy) / dt;

    mouseVelocity.current = Math.min(60, speed * 25);
    lastMousePos.current = { x: e.clientX, y: e.clientY, time: now };

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const xPct = (e.clientX - rect.left) / rect.width - 0.5;
      const yPct = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: -yPct * 6, y: xPct * 8 });
    }
  };

  return (
    <>
      <style>{`
        /* Desktop: 100% identical interactive canvas */
        .hero-portrait-desktop {
          position: absolute;
          z-index: 10;
          pointer-events: auto;
          user-select: none;
          width: clamp(240px, 25vw, 380px);
          aspect-ratio: 1 / 1.5;
          transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
          display: block;
        }

        .hero-portrait-desktop canvas {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          pointer-events: auto;
          filter: contrast(1.04) brightness(0.98);
        }

        /* Mobile collectible card hidden on desktop */
        .hero-portrait-card-mobile {
          display: none;
        }

        /* Mobile Viewport: Switch to Japanese Vintage Collectible Card */
        @media (max-width: 860px) {
          .hero-portrait-desktop {
            display: none !important;
          }

          .hero-portrait-card-mobile {
            display: flex;
            flex-direction: column;
            position: relative;
            z-index: 12;
            width: min(88vw, 310px);
            margin: 1rem auto 0.75rem;
            background: #F4EFE6;
            background-image: 
              radial-gradient(rgba(42, 39, 35, 0.08) 1px, transparent 1px),
              radial-gradient(rgba(42, 39, 35, 0.05) 1px, #F4EFE6 1px);
            background-size: 16px 16px;
            background-position: 0 0, 8px 8px;
            border: 1.5px solid #2B2824;
            border-radius: 4px;
            box-shadow:
              0 14px 32px -6px rgba(32, 28, 24, 0.26),
              0 4px 10px rgba(32, 28, 24, 0.1),
              inset 0 0 0 1px rgba(255, 255, 255, 0.4);
            padding: 8px;
            box-sizing: border-box;
            user-select: none;
            overflow: hidden;
            animation: card-appear 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
          }

          @keyframes card-appear {
            from {
              opacity: 0;
              transform: translateY(12px) scale(0.97);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          /* Inset border & corner decorations */
          .hp-card-inner {
            position: relative;
            display: flex;
            flex-direction: column;
            border: 1px solid rgba(43, 40, 36, 0.45);
            border-radius: 2px;
            padding: 8px 10px 10px;
            background: rgba(255, 255, 255, 0.25);
          }

          /* Vintage corner brackets */
          .hp-corner {
            position: absolute;
            font-size: 11px;
            line-height: 1;
            font-family: monospace;
            color: #2B2824;
            opacity: 0.75;
            pointer-events: none;
          }
          .hp-corner--tl { top: 4px; left: 5px; }
          .hp-corner--tr { top: 4px; right: 5px; }
          .hp-corner--bl { bottom: 4px; left: 5px; }
          .hp-corner--br { bottom: 4px; right: 5px; }

          /* Header Section */
          .hp-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            position: relative;
            z-index: 3;
            padding-top: 2px;
          }

          .hp-kanji-col {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-left: 2px;
          }
          .hp-kanji {
            font-family: "Hiragino Mincho ProN", "Yu Mincho", "MS Mincho", "Noto Serif JP", serif;
            font-size: 1.15rem;
            font-weight: 700;
            line-height: 1.05;
            color: #26231F;
            letter-spacing: 0.05em;
            text-shadow: 0 0 1px rgba(0,0,0,0.1);
          }
          .hp-kanji-line {
            width: 1px;
            height: 34px;
            background: #26231F;
            margin-top: 6px;
            opacity: 0.85;
          }

          .hp-stamp-col {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 6px;
          }
          .hp-words {
            font-family: var(--font-mono, monospace);
            font-size: 0.58rem;
            font-weight: 700;
            line-height: 1.25;
            letter-spacing: 0.08em;
            text-align: right;
            color: #2E2B27;
          }

          /* Hanko woodblock stamp */
          .hp-hanko {
            width: 32px;
            height: 32px;
            border: 1.5px solid #A63428;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(166, 52, 40, 0.05);
            color: #A63428;
            transform: rotate(-1.5deg);
            box-shadow: inset 0 0 0 1px rgba(166, 52, 40, 0.2);
          }

          /* Center Image Frame */
          .hp-image-container {
            position: relative;
            width: 100%;
            height: 220px;
            margin: 2px 0 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          /* Background wave art */
          .hp-wave-bg {
            position: absolute;
            inset: -10px;
            background-image: url('/img/kanagawa-ascii-transparent.webp');
            background-size: cover;
            background-position: center bottom;
            opacity: 0.38;
            filter: contrast(1.15) brightness(0.95);
            pointer-events: none;
            z-index: 1;
          }

          /* User portrait */
          .hp-portrait-img {
            position: relative;
            z-index: 2;
            height: 100%;
            width: auto;
            max-width: 100%;
            object-fit: contain;
            object-position: bottom center;
            filter: contrast(1.05) brightness(0.98);
          }

          /* Footer Section */
          .hp-card-footer {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            position: relative;
            z-index: 3;
            padding-top: 4px;
          }

          .hp-title {
            align-self: flex-start;
            font-family: var(--font-mono, monospace);
            font-size: 0.82rem;
            font-weight: 700;
            color: #24221E;
            letter-spacing: 0.02em;
            margin-bottom: 4px;
            padding-left: 2px;
          }

          .hp-divider {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            gap: 6px;
            color: #4A453F;
            font-size: 0.7rem;
            opacity: 0.8;
            margin: 2px 0 4px;
          }

          .hp-divider-line {
            flex: 1;
            height: 1px;
            border-top: 1px dashed #5A544C;
          }

          .hp-divider-star {
            font-size: 0.85rem;
            line-height: 1;
            color: #2B2824;
          }

          .hp-quote {
            font-family: var(--font-body, serif);
            font-style: italic;
            font-size: 0.73rem;
            line-height: 1.38;
            color: #3C3833;
            margin: 0;
            padding: 0 4px;
            text-align: center;
          }
        }
      `}</style>

      {/* 1. Desktop View (Original Canvas Component) */}
      <div
        ref={containerRef}
        className={`hero-portrait-desktop ${className}`}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => {
          setIsHovered(false);
          setTilt({ x: 0, y: 0 });
        }}
        style={{
          ...style,
          transform: `${style?.transform || ""} perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`.trim(),
        }}
      >
        <canvas ref={canvasRef} />
      </div>

      {/* 2. Mobile View (Japanese Vintage Collectible Card) */}
      <div className={`hero-portrait-card-mobile ${className}`}>
        <div className="hp-card-inner">
          {/* Corner Crosshairs */}
          <span className="hp-corner hp-corner--tl">+</span>
          <span className="hp-corner hp-corner--tr">+</span>
          <span className="hp-corner hp-corner--bl">+</span>
          <span className="hp-corner hp-corner--br">+</span>

          {/* Top Row: Kanji & Hanko Stamp */}
          <div className="hp-card-header">
            <div className="hp-kanji-col">
              <span className="hp-kanji">継</span>
              <span className="hp-kanji">続</span>
              <span className="hp-kanji-line" />
            </div>

            <div className="hp-stamp-col">
              <div className="hp-words">
                BUILD<br />
                TRAIN<br />
                INNOVATE
              </div>
              <div className="hp-hanko" title="Hanko Seal">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 17c3-3 6-3 9 0 3-3 6-3 9 0" />
                  <path d="M2 13c3-3 6-3 9 0 3-3 6-3 9 0" />
                  <path d="M6 8a4 4 0 0 1 8 0c0 3-4 6-4 6" />
                  <circle cx="12" cy="7" r="1.5" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>

          {/* Center Image Frame */}
          <div className="hp-image-container">
            <div className="hp-wave-bg" />
            <img
              src={src}
              alt="Sivabalan - AI Developer"
              className="hp-portrait-img"
              loading="eager"
            />
          </div>

          {/* Bottom Row: AI Enthusiast & Mission */}
          <div className="hp-card-footer">
            <div className="hp-title">AI Enthusiast</div>
            <div className="hp-divider">
              <span className="hp-divider-line" />
              <span className="hp-divider-star">✳</span>
              <span className="hp-divider-line" />
            </div>
            <p className="hp-quote">
              Exploring AI, building smarter solutions,<br />
              and turning ideas into intelligent experiences.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
