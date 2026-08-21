"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface PixelRevealProps {
  src: string;
  alt?: string;
  className?: string;
  gridSize?: number; // How many blocks per row/col (approx)
  delay?: number;
  duration?: number;
  width?: number;
  height?: number;
}

export default function PixelReveal({
  src,
  alt = "",
  className = "",
  gridSize = 25,
  delay = 0.2,
  duration = 1.2,
  width,
  height,
}: PixelRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-10%" });
  const [imgLoaded, setImgLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const animationRef = useRef<number>(0);

  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      imageRef.current = img;
      setImgLoaded(true);
    };
  }, [src]);

  // Handle animation
  useEffect(() => {
    if (!imgLoaded || !isInView || !canvasRef.current || !containerRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imageRef.current;
    
    // Setup canvas dimensions to match container while keeping aspect ratio
    const rect = containerRef.current.getBoundingClientRect();
    
    const canvasW = rect.width;
    const canvasH = rect.height || rect.width / (img.width / img.height);

    // High DPI display support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasW * dpr;
    canvas.height = canvasH * dpr;
    canvas.style.width = `${canvasW}px`;
    canvas.style.height = `${canvasH}px`;
    
    // We do NOT use ctx.scale(dpr, dpr) here because we will pre-render to an offscreen canvas
    // at exact device pixel coordinates to ensure 1-to-1 crisp mapping.

    // Calculate grid
    const imgAspect = img.width / img.height;
    const canvasAspect = canvasW / canvasH;
    
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (imgAspect > canvasAspect) {
        sh = img.height;
        sw = img.height * canvasAspect;
        sx = (img.width - sw) / 2;
    } else {
        sw = img.width;
        sh = img.width / canvasAspect;
        sy = (img.height - sh) / 2;
    }

    // Pre-render the cropped image to an offscreen canvas ONCE (Performance Optimization)
    // This avoids 600+ complex drawImage source-mapping calls per frame.
    const offscreen = document.createElement("canvas");
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const offCtx = offscreen.getContext("2d");
    if (offCtx) {
      offCtx.drawImage(img, sx, sy, sw, sh, 0, 0, offscreen.width, offscreen.height);
    }

    // Block dimensions on canvas (in physical pixels)
    const blockW = offscreen.width / gridSize;
    const blockH = offscreen.height / (gridSize / (canvasW / canvasH)); // keep blocks relatively square
    const cols = Math.ceil(offscreen.width / blockW);
    const rows = Math.ceil(offscreen.height / blockH);

    // Initialize blocks with random delays
    const blocks: { c: number; r: number; delay: number; opacity: number }[] = [];
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        blocks.push({
          c,
          r,
          delay: Math.random() * (duration * 0.6), // Random delay up to 60% of duration
          opacity: 0,
        });
      }
    }

    let startTime: number | null = null;

    const render = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000 - delay; // in seconds

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let allDone = true;

      // 1. Draw the alpha mask using fillRect (very fast)
      ctx.fillStyle = "#000";
      
      blocks.forEach((b) => {
        if (elapsed > b.delay) {
          // Fade in duration for each pixel is 0.4s
          const fadeProgress = Math.min(1, Math.max(0, (elapsed - b.delay) / 0.4));
          // She asked for a smooth fade, so we use ease out
          const easeOut = 1 - Math.pow(1 - fadeProgress, 3);
          b.opacity = easeOut;
          
          if (fadeProgress < 1) allDone = false;
        } else {
          allDone = false;
        }

        if (b.opacity > 0) {
          ctx.globalAlpha = b.opacity;
          const dx = b.c * blockW;
          const dy = b.r * blockH;
          // Add a tiny overlap (+0.5) to prevent grid lines from subpixel rendering
          ctx.fillRect(dx, dy, blockW + 0.5, blockH + 0.5);
        }
      });

      // 2. Composite the pre-rendered image over the mask (1 draw call instead of 600+)
      ctx.globalCompositeOperation = "source-in";
      ctx.globalAlpha = 1;
      ctx.drawImage(offscreen, 0, 0);
      
      // 3. Reset composite mode
      ctx.globalCompositeOperation = "source-over";

      if (!allDone) {
        animationRef.current = requestAnimationFrame(render);
      }
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [imgLoaded, isInView, gridSize, delay, duration]);

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={width && height ? { aspectRatio: `${width}/${height}` } : undefined}
    >
      <canvas ref={canvasRef} className="block max-w-full max-h-full w-full" />
      {/* Fallback for screen readers */}
      <span className="sr-only">{alt}</span>
    </div>
  );
}
