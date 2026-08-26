"use client";

import { useEffect, useRef } from "react";

const ART_VISIBLE_BOTTOM_RATIO = 996 / 1034;
const MOBILE_MAX_WIDTH = 860;
const MOBILE_ART_ZOOM = 1.06;
const MOBILE_OPACITY_BOOST = 1.45;
const MOBILE_HORIZONTAL_FOCUS = .48;

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  intensity: number;
  born: number;
}

export default function StaticKanagawa({
  className,
  opacity = .3,
}: {
  className?: string;
  opacity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    const parent = canvas.parentElement ?? canvas;
    const image = new Image();
    image.decoding = "async";
    image.src = "/img/kanagawa-ascii-transparent.webp";

    const draw = () => {
      if (!image.naturalWidth || !image.naturalHeight) return;
      const rect = parent.getBoundingClientRect();
      const width = rect.width || window.innerWidth;
      const height = rect.height || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const mobile = width <= MOBILE_MAX_WIDTH;
      const bottomGap = mobile ? Math.min(12, Math.max(6, width * .005)) : 0;
      canvas.style.opacity = String(
        mobile ? Math.min(1, opacity * MOBILE_OPACITY_BOOST) : opacity,
      );
      const baseScale = mobile
        ? Math.max(
            width / image.naturalWidth,
            (height - bottomGap) /
              (image.naturalHeight * ART_VISIBLE_BOTTOM_RATIO),
          )
        : Math.max(
            width / image.naturalWidth,
            height / (image.naturalHeight * ART_VISIBLE_BOTTOM_RATIO),
          );

      const scale = baseScale * (mobile ? MOBILE_ART_ZOOM : 1.08);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const drawX = mobile
        ? width / 2 - drawWidth * MOBILE_HORIZONTAL_FOCUS
        : (width - drawWidth) / 2;
      const drawY = mobile
        ? height -
          bottomGap -
          image.naturalHeight * ART_VISIBLE_BOTTOM_RATIO * scale
        : 0;

      context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

      const now = performance.now();
      const activeRipples: Ripple[] = [];

      for (const r of ripplesRef.current) {
        const age = (now - r.born) / 750;
        if (age < 1) {
          const currentRadius = r.radius + (r.maxRadius - r.radius) * age;
          const currentAlpha = (1 - age) * r.intensity;

          context.save();
          context.beginPath();
          context.arc(r.x, r.y, currentRadius, 0, Math.PI * 2);
          context.strokeStyle = `rgba(28, 27, 24, ${currentAlpha * 0.45})`;
          context.lineWidth = 2 * (1 - age);
          context.stroke();

          const sliceHeight = 16;
          const sliceY = Math.max(0, r.y - currentRadius * 0.4);
          const sliceShift = Math.sin(age * Math.PI * 4) * 6 * (1 - age);
          if (sliceY < height) {
            context.drawImage(
              image,
              0, (sliceY - drawY) / scale, image.naturalWidth, sliceHeight / scale,
              drawX + sliceShift, sliceY, drawWidth, sliceHeight
            );
          }
          context.restore();

          activeRipples.push(r);
        }
      }

      ripplesRef.current = activeRipples;

      if (activeRipples.length > 0) {
        animFrameRef.current = requestAnimationFrame(draw);
      }
    };

    const addRipple = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      ripplesRef.current.push({
        x,
        y,
        radius: 8,
        maxRadius: Math.min(180, window.innerWidth * 0.45),
        intensity: 0.9,
        born: performance.now(),
      });
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(draw);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        addRipple(touch.clientX, touch.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0 && Math.random() > 0.6) {
        const touch = e.touches[0];
        addRipple(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    image.addEventListener("load", draw);
    window.addEventListener("resize", draw, { passive: true });
    if (image.complete && image.naturalWidth) draw();

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      image.removeEventListener("load", draw);
      window.removeEventListener("resize", draw);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}
