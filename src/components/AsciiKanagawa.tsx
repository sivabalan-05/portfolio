"use client";

import { useEffect, useRef } from "react";

const FRAME_MS = 1000 / 12;

const GLYPH_RAMP = [
  "·", "°", "⠂", "⠄", "⠆", "⠒", "⠤", "o", "✳︎", "✦", "✧", "⋆", "♡", "✿", "₊", "˚",
  "≈", "~", "⠶", "⠲", "⠴", "⠛", "⠿",
];

const UNIFIED_COLOR = "#173b58";
const ART_VISIBLE_BOTTOM_RATIO = 996 / 1034;

const hash = (x: number, y: number, seed = 0) => {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
};

class FrameLoop {
  frames: number;
  minVal: number;
  maxVal: number;
  val: number;

  constructor(frames = 300, minVal = 0, maxVal = 91) {
    this.frames = frames;
    this.minVal = minVal;
    this.maxVal = maxVal;
    this.val = 0;
  }

  set(v: number) {
    this.val = v % this.frames;
  }

  inc() {
    this.val = (this.val + 1) % this.frames;
  }

  get value() {
    const progress = this.val / this.frames;
    const t = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    return this.minVal + t * (this.maxVal - this.minVal);
  }
}

type MutationPoint = {
  col: number;
  row: number;
  x: number;
  y: number;
  strength: number;
  seed: number;
  blue?: number;
  red?: number;
  isContour?: boolean;
  frameLoop?: FrameLoop;
};

type Particle = {
  index: number;
  seed: number;
  speed: number;
  arc: number;
  type: number;
  glyph: string;
};

export default function AsciiKanagawa({
  className,
  style,
  src = "/img/kanagawa-ascii-transparent.webp",
  opacity = 0.52,
}: {
  className?: string;
  style?: React.CSSProperties;
  src?: string;
  opacity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const interactivePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (min-width: 861px)",
    );

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    const ctx = context;

    const parent = canvas.parentElement ?? canvas;
    const image = new Image();
    image.src = src;

    if (!interactivePointer.matches) {
      let staticWidth = 0;
      let staticHeight = 0;
      let staticDpr = 1;

      const drawStatic = () => {
        if (!image.naturalWidth || !image.naturalHeight) return;
        const rect = parent.getBoundingClientRect();
        staticWidth = rect.width || window.innerWidth;
        staticHeight = rect.height || window.innerHeight;
        staticDpr = Math.min(window.devicePixelRatio || 1, 1.25);
        canvas.width = Math.round(staticWidth * staticDpr);
        canvas.height = Math.round(staticHeight * staticDpr);
        ctx.setTransform(staticDpr, 0, 0, staticDpr, 0, 0);
        ctx.clearRect(0, 0, staticWidth, staticHeight);

        const bottomGap = Math.min(12, Math.max(6, staticWidth * 0.005));
        const scale = Math.min(
          staticWidth / image.naturalWidth,
          (staticHeight - bottomGap) /
            (image.naturalHeight * ART_VISIBLE_BOTTOM_RATIO),
        );
        const staticDrawWidth = image.naturalWidth * scale;
        const staticDrawHeight = image.naturalHeight * scale;
        const staticDrawX = (staticWidth - staticDrawWidth) / 2;
        const staticDrawY =
          staticHeight -
          bottomGap -
          image.naturalHeight * ART_VISIBLE_BOTTOM_RATIO * scale;

        ctx.drawImage(
          image,
          staticDrawX,
          staticDrawY,
          staticDrawWidth,
          staticDrawHeight,
        );
      };

      image.addEventListener("load", drawStatic);
      window.addEventListener("resize", drawStatic, { passive: true });
      if (image.complete && image.naturalWidth) drawStatic();

      return () => {
        image.removeEventListener("load", drawStatic);
        window.removeEventListener("resize", drawStatic);
      };
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let drawX = 0;
    let drawY = 0;
    let drawWidth = 0;
    let drawHeight = 0;
    let lastFrame = -Infinity;
    let raf = 0;
    let isVisible = false;
    let isRunning = false;

    let contourPoints: MutationPoint[] = [];
    let mutationMapWidth = 160;

    const spray: Particle[] = Array.from({ length: 64 }, (_, index) => ({
      index,
      seed: hash(index, 4, 2),
      speed: 0.4 + hash(index, 9, 1) * 0.9,
      arc: hash(index, 2, 7),
      type: index % 4,
      glyph: GLYPH_RAMP[index % GLYPH_RAMP.length],
    }));

    const sampleCanvas = document.createElement("canvas");
    const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });

    function fitImage() {
      if (!image.naturalWidth || !image.naturalHeight) return;
      const mobile = width <= 860;
      const bottomGap = mobile ? Math.min(12, Math.max(6, width * 0.005)) : 0;
      const baseScale = mobile
        ? Math.min(
            width / image.naturalWidth,
            (height - bottomGap) / (image.naturalHeight * ART_VISIBLE_BOTTOM_RATIO),
          )
        : Math.max(
            width / image.naturalWidth,
            height / (image.naturalHeight * ART_VISIBLE_BOTTOM_RATIO),
          );
      const scale = mobile ? baseScale : baseScale * 1.08;
      drawWidth = image.naturalWidth * scale;
      drawHeight = image.naturalHeight * scale;
      drawX = (width - drawWidth) / 2;
      drawY = mobile
        ? height -
          bottomGap -
          image.naturalHeight * ART_VISIBLE_BOTTOM_RATIO * scale
        : 0;
    }

    function buildWaveMap() {
      if (!image.naturalWidth || !image.naturalHeight || !sampleCtx) return;
      const mapWidth = 160;
      const mapHeight = Math.max(10, Math.round(mapWidth / (image.naturalWidth / image.naturalHeight)));
      mutationMapWidth = mapWidth;
      sampleCanvas.width = mapWidth;
      sampleCanvas.height = mapHeight;
      sampleCtx.drawImage(image, 0, 0, mapWidth, mapHeight);

      const pixels = sampleCtx.getImageData(0, 0, mapWidth, mapHeight).data;
      const totalCells = mapWidth * mapHeight;

      const rawMap = new Float32Array(totalCells);
      for (let y = 0; y < mapHeight; y += 1) {
        for (let x = 0; x < mapWidth; x += 1) {
          rawMap[y * mapWidth + x] = hash(x, y, 7) * 300;
        }
      }

      const smoothed = new Float32Array(totalCells);
      const BLUR_STEPS = 35;
      for (let step = 0; step < BLUR_STEPS; step += 1) {
        for (let y = 0; y < mapHeight; y += 1) {
          for (let x = 0; x < mapWidth; x += 1) {
            const idx = y * mapWidth + x;
            const left = rawMap[y * mapWidth + Math.max(0, x - 1)];
            const right = rawMap[y * mapWidth + Math.min(mapWidth - 1, x + 1)];
            const top = rawMap[Math.max(0, y - 1) * mapWidth + x];
            const bottom = rawMap[Math.min(mapHeight - 1, y + 1) * mapWidth + x];
            smoothed[idx] = (rawMap[idx] + left + right + top + bottom) / 5;
          }
        }
        rawMap.set(smoothed);
      }

      const waveRidgePoints: MutationPoint[] = [];
      const FRAMES = 150;
      const MAX_CHAR_IDX = GLYPH_RAMP.length - 1;

      for (let y = 1; y < mapHeight - 1; y += 1) {
        for (let x = 1; x < mapWidth - 1; x += 1) {
          const i = (y * mapWidth + x) * 4;
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];
          if (a < 24) continue;
          const darkness = 1 - (r * 0.299 + g * 0.587 + b * 0.114) / 255;
          if (darkness < 0.14) continue;

          let isBoundary = false;
          for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1]]) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < mapWidth && ny >= 0 && ny < mapHeight) {
              const ni = (ny * mapWidth + nx) * 4;
              const nAlpha = pixels[ni + 3];
              const nDarkness = 1 - (pixels[ni] * 0.299 + pixels[ni + 1] * 0.587 + pixels[ni + 2] * 0.114) / 255;
              if (nAlpha < 24 || nDarkness < 0.14) {
                isBoundary = true;
                break;
              }
            }
          }

          const initialValue = Math.floor((rawMap[y * mapWidth + x] % FRAMES));
          const loopObj = new FrameLoop(FRAMES, 0, MAX_CHAR_IDX);
          loopObj.set(initialValue);

          const pt: MutationPoint = {
            col: x,
            row: y,
            x: x / mapWidth,
            y: y / mapHeight,
            strength: darkness,
            seed: hash(x, y, 3) * 100,
            isContour: isBoundary,
            frameLoop: loopObj,
          };

          const sparseInterior =
            pt.strength > 0.62 && (pt.col * 3 + pt.row * 5) % 17 === 0;
          if (isBoundary || sparseInterior) {
            waveRidgePoints.push(pt);
          }
        }
      }

      contourPoints = waveRidgePoints;
    }

    function resize() {
      const rect = parent.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fitImage();
      ctx.font = `${width < 700 ? 9 : 11}px "Courier New", ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    }

    let glyphAtlas: HTMLCanvasElement | null = null;
    let glyphAtlasTile = 0;
    let glyphAtlasKey = 0;

    function buildGlyphAtlas(patchSize: number) {
      const tile = Math.ceil(patchSize * dpr) + 6;
      const sheet = document.createElement("canvas");
      sheet.width = tile * GLYPH_RAMP.length;
      sheet.height = tile;
      const c = sheet.getContext("2d");
      if (!c) return;
      c.font = `bold ${patchSize * dpr}px "Courier New", monospace`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillStyle = UNIFIED_COLOR;
      for (let i = 0; i < GLYPH_RAMP.length; i += 1) {
        const ch = GLYPH_RAMP[i];
        if (ch && ch !== " ") c.fillText(ch, i * tile + tile / 2, tile / 2);
      }
      glyphAtlas = sheet;
      glyphAtlasTile = tile;
      glyphAtlasKey = Math.round(patchSize);
    }

    function drawContourLoop() {
      if (reduceMotion || !contourPoints.length) return;
      const patchSize = Math.max(9, (drawWidth / mutationMapWidth) * 1.18);
      if (!glyphAtlas || glyphAtlasKey !== Math.round(patchSize)) buildGlyphAtlas(patchSize);
      if (!glyphAtlas) return;

      const tile = glyphAtlasTile;
      const half = patchSize / 2;
      const eraseSize = patchSize * 0.48;
      ctx.save();

      for (let i = 0; i < contourPoints.length; i += 1) {
        const pt = contourPoints[i];
        const x = drawX + pt.x * drawWidth;
        const y = drawY + pt.y * drawHeight;
        ctx.clearRect(x - eraseSize / 2, y - eraseSize / 2, eraseSize, eraseSize);
      }

      ctx.globalAlpha = 0.76;
      for (let i = 0; i < contourPoints.length; i += 1) {
        const pt = contourPoints[i];
        if (!pt.frameLoop) continue;
        const charIdx = Math.round(pt.frameLoop.value);
        pt.frameLoop.inc();
        const idx = charIdx % GLYPH_RAMP.length;
        const x = drawX + pt.x * drawWidth;
        const y = drawY + pt.y * drawHeight;
        ctx.drawImage(glyphAtlas, idx * tile, 0, tile, tile, x - half, y - half, patchSize, patchSize);
      }
      ctx.restore();
    }

    function drawBase() {
      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    }

    function drawSpray(seconds: number) {
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = UNIFIED_COLOR;

      for (const particle of spray) {
        let x = 0;
        let y = 0;

        if (particle.type === 0) {
          const angle = particle.seed * Math.PI * 2 - seconds * (0.42 + particle.speed * 0.28);
          const radiusX = 0.058 + particle.arc * 0.045;
          const radiusY = 0.105 + particle.arc * 0.075;
          const turbulence = Math.sin(seconds * 1.45 + particle.seed * 29) * 0.009;

          x = drawX + drawWidth * (0.555 + Math.cos(angle) * radiusX + turbulence);
          y = drawY + drawHeight * (0.425 + Math.sin(angle) * radiusY + Math.cos(angle * 2.2) * 0.014);
        } else if (particle.type === 1) {
          const life = (seconds * 0.24 * particle.speed + particle.seed) % 1;
          const spread = particle.arc - 0.5;
          const flutter = Math.sin(seconds * 1.9 + particle.seed * 31) * 0.014;

          x = drawX + drawWidth * (0.49 + spread * 0.08 + life * (0.15 + spread * 0.04) + flutter * life);
          y = drawY + drawHeight * (
            0.31 + spread * 0.08 - Math.sin(life * Math.PI) * (0.13 + particle.seed * 0.065) +
            life * 0.085 + Math.cos(seconds * 1.35 + particle.seed * 19) * 0.008
          );
        } else if (particle.type === 2) {
          const life = (seconds * 0.2 * particle.speed + particle.seed * 3.3) % 1;
          const ripple = Math.sin(seconds * 3.4 + particle.seed * 11) * 0.014;

          x = drawX + drawWidth * (0.38 - life * 0.24 + ripple);
          y = drawY + drawHeight * (0.28 + life * 0.5 + Math.sin(life * Math.PI * 2) * 0.022);
        } else {
          const life = (seconds * 0.16 * particle.speed + particle.seed * 7.1) % 1;
          const driftX = Math.sin(seconds * 1.5 + particle.seed * 17) * 0.02;
          const driftY = Math.cos(seconds * 1.2 + particle.seed * 23) * 0.014;

          x = drawX + drawWidth * (0.45 + particle.arc * 0.22 + life * 0.09 + driftX);
          y = drawY + drawHeight * (0.18 + particle.seed * 0.22 - life * 0.055 + driftY);
        }

        const glyph = GLYPH_RAMP[(particle.index + Math.floor(seconds * 6.5)) % GLYPH_RAMP.length];
        ctx.fillText(glyph, x, y);
      }

      ctx.restore();
    }

    function draw(time: number) {
      if (!image.complete || !image.naturalWidth) return;
      const seconds = time * 0.001;
      ctx.clearRect(0, 0, width, height);

      drawBase();
      drawContourLoop();
      drawSpray(seconds);
    }

    function loop(time: number) {
      if (!isRunning || !isVisible) return;
      raf = requestAnimationFrame(loop);
      if (time - lastFrame < FRAME_MS) return;
      lastFrame = time;
      draw(time);
    }

    const startLoop = () => {
      if (
        reduceMotion ||
        document.visibilityState === "hidden" ||
        isRunning ||
        !isVisible ||
        !image.complete ||
        !image.naturalWidth
      ) return;
      isRunning = true;
      lastFrame = -Infinity;
      raf = requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      isRunning = false;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const handleImageLoad = () => {
      resize();
      buildWaveMap();
      draw(performance.now());
    };

    const handleResize = () => {
      resize();
      if (image.complete && image.naturalWidth) draw(performance.now());
    };

    image.addEventListener("load", handleImageLoad);

    if (image.complete && image.naturalWidth) {
      handleImageLoad();
    }

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          draw(performance.now());
          startLoop();
          return;
        }
        stopLoop();
      },
      { rootMargin: "120px 0px", threshold: 0 },
    );
    visibilityObserver.observe(canvas);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopLoop();
        return;
      }
      startLoop();
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopLoop();
      visibilityObserver.disconnect();
      image.removeEventListener("load", handleImageLoad);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      className={`${className ?? ""} ak-canvas`}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
