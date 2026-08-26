"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import { useCreativeStudio } from "./CreativeStudio";

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
  const mobileCardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processedImgCanvas = useRef<HTMLCanvasElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { playSound } = useCreativeStudio();

  const mouseVelocity = useRef(0);
  const lastMousePos = useRef({ x: 0, y: 0, time: 0 });
  const blockFactor = useRef(1);

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [mobileTilt, setMobileTilt] = useState({ x: 0, y: 0, sheenX: 50, sheenY: 50 });

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      const offscreen = document.createElement("canvas");
      offscreen.width = img.naturalWidth || img.width;
      offscreen.height = img.naturalHeight || img.height;
      const ctx = offscreen.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (r > 238 && g > 238 && b > 238) {
          const brightness = (r + g + b) / 3;
          if (brightness > 248) {
            data[i + 3] = 0;
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

  useEffect(() => {
    if (!isLoaded || !canvasRef.current || !containerRef.current || !processedImgCanvas.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sourceCanvas = processedImgCanvas.current;
    let frameId: number;

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

      const targetFactor = isHovered ? 2.5 : Math.max(1, 1 + mouseVelocity.current * 0.04);
      blockFactor.current += (targetFactor - blockFactor.current) * 0.12;
      mouseVelocity.current *= 0.88;

      const currentBlock = Math.round(blockFactor.current);

      if (currentBlock <= 1 || prefersReducedMotion) {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(sourceCanvas, 0, 0, width, height);
      } else {
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

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [isLoaded, isHovered, prefersReducedMotion]);

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

  const handleMobileTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!mobileCardRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = mobileCardRef.current.getBoundingClientRect();
    const xPct = (touch.clientX - rect.left) / rect.width;
    const yPct = (touch.clientY - rect.top) / rect.height;
    
    setMobileTilt({
      x: -(yPct - 0.5) * 16,
      y: (xPct - 0.5) * 18,
      sheenX: Math.round(xPct * 100),
      sheenY: Math.round(yPct * 100),
    });
  }, []);

  const handleMobileTouchEnd = useCallback(() => {
    setMobileTilt((prev) => ({ ...prev, x: 0, y: 0, sheenX: 50, sheenY: 50 }));
  }, []);

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      const rotY = Math.min(15, Math.max(-15, e.gamma * 0.4));
      const rotX = Math.min(15, Math.max(-15, (e.beta - 45) * 0.3));
      const sheenX = Math.min(100, Math.max(0, 50 + e.gamma * 1.2));
      const sheenY = Math.min(100, Math.max(0, 50 + (e.beta - 45) * 1.2));
      setMobileTilt({ x: rotX, y: rotY, sheenX, sheenY });
    };

    if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation, { passive: true });
      return () => window.removeEventListener("deviceorientation", handleOrientation);
    }
  }, []);

  const handleCardFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
    playSound("flip");
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(10);
    }
  }, [playSound]);

  return (
    <>
      <style>{`
        .hero-portrait-desktop {
          position: absolute;
          z-index: 10;
          pointer-events: auto;
          user-select: none;
          width: clamp(240px, 25vw, 380px);
          aspect-ratio: 1 / 1.5;
          transition: transform .25s cubic-bezier(.2, .8, .2, 1);
          display: block;
        }
        .hero-portrait-desktop canvas {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          pointer-events: auto;
          filter: contrast(1.04) brightness(.98);
        }
        .hero-portrait-card-mobile {
          display: none;
        }

        @media (max-width: 860px) {
          .hero-portrait-desktop {
            display: none !important;
          }
          .hero-portrait-card-mobile {
            display: block;
            position: relative;
            z-index: 12;
            width: min(90vw, 320px);
            margin: 1rem auto .85rem;
            perspective: 1000px;
            user-select: none;
            touch-action: pan-y;
            animation: card-appear .6s cubic-bezier(.16, 1, .3, 1) both;
          }
          @keyframes card-appear {
            from { opacity: 0; transform: translateY(12px) scale(.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .hp-card-flipper {
            position: relative;
            width: 100%;
            transition: transform .65s cubic-bezier(.34, 1.4, .64, 1);
            transform-style: preserve-3d;
            cursor: pointer;
          }
          .hp-card-flipper[data-flipped="true"] {
            transform: rotateY(180deg);
          }
          .hp-card-face {
            width: 100%;
            border-radius: 6px;
            border: 1.5px solid #2B2824;
            padding: 8px;
            box-sizing: border-box;
            background: #F4EFE6;
            background-image: 
              radial-gradient(rgba(42, 39, 35, 0.08) 1px, transparent 1px),
              radial-gradient(rgba(42, 39, 35, 0.05) 1px, #F4EFE6 1px);
            background-size: 16px 16px;
            background-position: 0 0, 8px 8px;
            box-shadow:
              0 16px 36px -8px rgba(32, 28, 24, .28),
              0 4px 12px rgba(32, 28, 24, .12),
              inset 0 0 0 1px rgba(255, 255, 255, .45);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            overflow: hidden;
            position: relative;
          }
          .hp-card-face--back {
            position: absolute;
            inset: 0;
            transform: rotateY(180deg);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .hp-foil-sheen {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 10;
            border-radius: inherit;
            background: linear-gradient(
              calc(var(--sheen-angle, 115deg)),
              transparent 20%,
              rgba(255, 255, 255, .15) 38%,
              rgba(255, 255, 255, .48) 50%,
              rgba(255, 255, 255, .15) 62%,
              transparent 80%
            );
            background-size: 200% 200%;
            background-position: calc(var(--sheen-x, 50) * 1%) calc(var(--sheen-y, 50) * 1%);
            mix-blend-mode: overlay;
            opacity: .85;
            transition: opacity .3s ease;
          }
          .hp-card-inner {
            position: relative;
            display: flex;
            flex-direction: column;
            border: 1px solid rgba(43, 40, 36, .45);
            border-radius: 3px;
            padding: 8px 10px 10px;
            background: rgba(255, 255, 255, .28);
            min-height: 380px;
          }
          .hp-corner {
            position: absolute;
            font-size: 11px;
            line-height: 1;
            font-family: monospace;
            color: #2B2824;
            opacity: .75;
            pointer-events: none;
          }
          .hp-corner--tl { top: 4px; left: 5px; }
          .hp-corner--tr { top: 4px; right: 5px; }
          .hp-corner--bl { bottom: 4px; left: 5px; }
          .hp-corner--br { bottom: 4px; right: 5px; }
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
            letter-spacing: .05em;
            text-shadow: 0 0 1px rgba(0,0,0,.1);
          }
          .hp-kanji-line {
            width: 1px;
            height: 34px;
            background: #26231F;
            margin-top: 6px;
            opacity: .85;
          }
          .hp-stamp-col {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 6px;
          }
          .hp-words {
            font-family: var(--font-mono, monospace);
            font-size: .58rem;
            font-weight: 700;
            line-height: 1.25;
            letter-spacing: .08em;
            text-align: right;
            color: #2E2B27;
          }
          .hp-hanko {
            width: 32px;
            height: 32px;
            border: 1.5px solid #A63428;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(166, 52, 40, .05);
            color: #A63428;
            transform: rotate(-1.5deg);
            box-shadow: inset 0 0 0 1px rgba(166, 52, 40, .2);
          }
          .hp-image-container {
            position: relative;
            width: 100%;
            height: 215px;
            margin: 2px 0 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .hp-wave-bg {
            position: absolute;
            inset: -10px;
            background-image: url('/img/kanagawa-ascii-transparent.webp');
            background-size: cover;
            background-position: center bottom;
            opacity: .38;
            filter: contrast(1.15) brightness(.95);
            pointer-events: none;
            z-index: 1;
          }
          .hp-portrait-img {
            position: relative;
            z-index: 2;
            height: 100%;
            width: auto;
            max-width: 100%;
            object-fit: contain;
            object-position: bottom center;
            filter: contrast(1.05) brightness(.98);
          }
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
            font-size: .82rem;
            font-weight: 700;
            color: #24221E;
            letter-spacing: .02em;
            margin-bottom: 2px;
            padding-left: 2px;
          }
          .hp-divider {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            gap: 6px;
            color: #4A453F;
            font-size: .7rem;
            opacity: .8;
            margin: 2px 0 4px;
          }
          .hp-divider-line {
            flex: 1;
            height: 1px;
            border-top: 1px dashed #5A544C;
          }
          .hp-divider-star {
            font-size: .85rem;
            line-height: 1;
            color: #2B2824;
          }
          .hp-quote {
            font-family: var(--font-body, serif);
            font-style: italic;
            font-size: .73rem;
            line-height: 1.35;
            color: #3C3833;
            margin: 0;
            padding: 0 4px;
            text-align: center;
          }
          .hp-flip-hint {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            margin-top: 6px;
            padding: 2px 8px;
            border: 1px dashed rgba(43, 40, 36, .4);
            border-radius: 99px;
            font-family: var(--font-mono), monospace;
            font-size: .65rem;
            letter-spacing: .04em;
            color: #1C1B18;
            background: rgba(255, 255, 255, .5);
          }
          .hp-back-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px dashed rgba(43, 40, 36, .35);
            padding-bottom: 6px;
            margin-bottom: 8px;
          }
          .hp-back-title {
            font-family: var(--font-mono), monospace;
            font-size: .78rem;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
            color: #24221E;
          }
          .hp-back-id {
            font-family: var(--font-mono), monospace;
            font-size: .68rem;
            opacity: .65;
          }
          .hp-stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 10px;
          }
          .hp-stat-card {
            border: 1px solid rgba(43, 40, 36, .25);
            background: rgba(255, 255, 255, .45);
            border-radius: 3px;
            padding: 6px 8px;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .hp-stat-label {
            font-family: var(--font-mono), monospace;
            font-size: .62rem;
            text-transform: uppercase;
            letter-spacing: .05em;
            opacity: .65;
            color: #2E2B27;
          }
          .hp-stat-val {
            font-family: var(--font-subtitle, monospace);
            font-size: .95rem;
            font-weight: 700;
            color: #1C1B18;
            line-height: 1.1;
          }
          .hp-stat-sub {
            font-family: var(--font-body), sans-serif;
            font-size: .68rem;
            opacity: .8;
            color: #3C3833;
          }
          .hp-terminal-box {
            border: 1px dashed rgba(43, 40, 36, .35);
            background: rgba(30, 28, 25, .04);
            border-radius: 3px;
            padding: 8px;
            font-family: var(--font-mono), monospace;
            font-size: .68rem;
            line-height: 1.45;
            color: #2A2622;
            margin-bottom: 8px;
          }
          .hp-terminal-prompt {
            color: #A63428;
            font-weight: 700;
          }
          .hp-back-seal-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 6px;
            border-top: 1px dashed rgba(43, 40, 36, .35);
          }
          .hp-status-chip {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            font-family: var(--font-mono), monospace;
            font-size: .66rem;
            color: #1C1B18;
            font-weight: 600;
          }
          .hp-status-pulse {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #238636;
            box-shadow: 0 0 6px #238636;
          }
        }
      `}</style>

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

      <div
        ref={mobileCardRef}
        className={`hero-portrait-card-mobile ${className}`}
        onTouchMove={handleMobileTouchMove}
        onTouchEnd={handleMobileTouchEnd}
        onClick={handleCardFlip}
        style={{
          transform: `perspective(900px) rotateX(${mobileTilt.x}deg) rotateY(${mobileTilt.y}deg)`,
          transition: mobileTilt.x === 0 ? "transform .5s ease-out" : "none",
        }}
      >
        <div
          className="hp-card-flipper"
          data-flipped={isFlipped ? "true" : "false"}
        >
          <div
            className="hp-card-face hp-card-face--front"
            style={{
              ["--sheen-x" as string]: mobileTilt.sheenX,
              ["--sheen-y" as string]: mobileTilt.sheenY,
              ["--sheen-angle" as string]: `${115 + mobileTilt.y * 1.5}deg`,
            }}
          >
            <div className="hp-foil-sheen" />
            <div className="hp-card-inner">
              <span className="hp-corner hp-corner--tl">+</span>
              <span className="hp-corner hp-corner--tr">+</span>
              <span className="hp-corner hp-corner--bl">+</span>
              <span className="hp-corner hp-corner--br">+</span>

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
                  <div className="hp-hanko" title="Seal">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 17c3-3 6-3 9 0 3-3 6-3 9 0" />
                      <path d="M2 13c3-3 6-3 9 0 3-3 6-3 9 0" />
                      <path d="M6 8a4 4 0 0 1 8 0c0 3-4 6-4 6" />
                      <circle cx="12" cy="7" r="1.5" fill="currentColor" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="hp-image-container">
                <div className="hp-wave-bg" />
                <img
                  src={src}
                  alt="Sivabalan - AI Developer"
                  className="hp-portrait-img"
                  loading="eager"
                />
              </div>

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
                <div className="hp-flip-hint">
                  <span>↺ tap to flip stats</span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="hp-card-face hp-card-face--back"
            style={{
              ["--sheen-x" as string]: 100 - mobileTilt.sheenX,
              ["--sheen-y" as string]: mobileTilt.sheenY,
              ["--sheen-angle" as string]: `${115 - mobileTilt.y * 1.5}deg`,
            }}
          >
            <div className="hp-foil-sheen" />
            <div className="hp-card-inner">
              <span className="hp-corner hp-corner--tl">+</span>
              <span className="hp-corner hp-corner--tr">+</span>
              <span className="hp-corner hp-corner--bl">+</span>
              <span className="hp-corner hp-corner--br">+</span>

              <div className="hp-back-header">
                <span className="hp-back-title">DEV DOSSIER // STATS</span>
                <span className="hp-back-id">ID: SIVA-2025</span>
              </div>

              <div className="hp-stats-grid">
                <div className="hp-stat-card">
                  <span className="hp-stat-label">Coding Exp</span>
                  <span className="hp-stat-val">3+ Yrs</span>
                  <span className="hp-stat-sub">Since 2023</span>
                </div>
                <div className="hp-stat-card">
                  <span className="hp-stat-label">AI Systems</span>
                  <span className="hp-stat-val">10+ Shipped</span>
                  <span className="hp-stat-sub">PyTorch & CV</span>
                </div>
                <div className="hp-stat-card">
                  <span className="hp-stat-label">Core Stack</span>
                  <span className="hp-stat-val">Python / JS</span>
                  <span className="hp-stat-sub">FastAPI · React</span>
                </div>
                <div className="hp-stat-card">
                  <span className="hp-stat-label">Focus Area</span>
                  <span className="hp-stat-val">ZTNA & CV</span>
                  <span className="hp-stat-sub">DeepFace · IoT</span>
                </div>
              </div>

              <div className="hp-terminal-box">
                <div><span className="hp-terminal-prompt">&gt;</span> sys.status: OPERATIONAL</div>
                <div><span className="hp-terminal-prompt">&gt;</span> degree: B.Tech (IT) @ MVIT</div>
                <div><span className="hp-terminal-prompt">&gt;</span> location: Puducherry, India</div>
                <div><span className="hp-terminal-prompt">&gt;</span> target: AI & Full-Stack Roles</div>
              </div>

              <div className="hp-back-seal-row">
                <div className="hp-status-chip">
                  <span className="hp-status-pulse" />
                  <span>AVAILABLE FOR WORK</span>
                </div>
                <div className="hp-hanko" style={{ width: 28, height: 28 }}>
                  <span style={{ fontSize: ".72rem", fontFamily: "serif", fontWeight: "bold" }}>印</span>
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: 4 }}>
                <div className="hp-flip-hint">
                  <span>↺ tap to flip front</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
