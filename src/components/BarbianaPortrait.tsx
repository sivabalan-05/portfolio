"use client";

import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface BarbianaPortraitProps {
  src?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function BarbianaPortrait({
  src = "/img/IMG_6379.png",
  className = "",
  style,
}: BarbianaPortraitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processedImgCanvas = useRef<HTMLCanvasElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Mouse velocity tracking for mosaic effect
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

      // Flood fill or key out near-white background pixels
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

  // Main Canvas Render Loop (Fixed, Clean Cutout + Barbiana Mosaic Glitch)
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
    <div
      ref={containerRef}
      className={`barbiana-cutout ${className}`}
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
      <style>{`
        .barbiana-cutout {
          position: absolute;
          z-index: 10;
          pointer-events: auto;
          user-select: none;
          width: clamp(240px, 25vw, 380px);
          aspect-ratio: 1 / 1.5;
          transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .barbiana-cutout canvas {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          pointer-events: auto;
          filter: contrast(1.04) brightness(0.98);
        }

        @media (max-width: 860px) {
          .barbiana-cutout {
            position: relative;
            margin: 2rem auto 1rem;
            left: auto !important;
            right: auto !important;
            top: auto !important;
            bottom: auto !important;
            width: min(75vw, 320px);
          }
        }
      `}</style>

      <canvas ref={canvasRef} />
    </div>
  );
}
