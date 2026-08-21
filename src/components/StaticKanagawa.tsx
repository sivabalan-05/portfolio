"use client";

import { useEffect, useRef } from "react";

const ART_VISIBLE_BOTTOM_RATIO = 996 / 1034;
const MOBILE_MAX_WIDTH = 860;
const MOBILE_ART_ZOOM = 1.06;
const MOBILE_OPACITY_BOOST = 1.45;
const MOBILE_HORIZONTAL_FOCUS = .48;

export default function StaticKanagawa({
  className,
  opacity = .3,
}: {
  className?: string;
  opacity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
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
      // A gravura funciona como background cover: preenche a tela, aceita
      // recorte e mantém a crista como ponto focal sem distorcer a imagem.
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
    };

    image.addEventListener("load", draw);
    window.addEventListener("resize", draw, { passive: true });
    if (image.complete && image.naturalWidth) draw();

    return () => {
      image.removeEventListener("load", draw);
      window.removeEventListener("resize", draw);
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
