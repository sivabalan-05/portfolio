"use client";

import { useEffect, useRef } from "react";

const FRAME_MS = 1000 / 15;
const ALPHA_STEPS = 4;

// Índices 0-3 = as quatro orientações (na ordem do eixo Y do canvas, pra baixo:
// 45° aponta pra baixo-direita = "\"). 4 = a cruz das cristas.
// 5+ = poeira Braille, a assinatura do site nos vales da onda.
const GLYPHS = ["-", "\\", "|", "/", "+", "⠂", "⠄", "⠆", "⠒", "⠤", "·"];
const CROSS = 4;
const DUST = [5, 6, 7, 8, 9, 10];

function hash(ix: number, iy: number, seed: number) {
  let n = (ix * 374761393 + iy * 668265263 + seed * 362437) | 0;
  n = (n ^ (n >> 13)) | 0;
  n = Math.imul(n, 1274126177) | 0;
  return ((n ^ (n >> 16)) & 0x7fffffff) / 0x7fffffff;
}

function smooth(value: number) {
  return value * value * (3 - 2 * value);
}

function noise(x: number, y: number, seed: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const a = hash(ix, iy, seed);
  const b = hash(ix + 1, iy, seed);
  const c = hash(ix, iy + 1, seed);
  const d = hash(ix + 1, iy + 1, seed);
  const top = a + (b - a) * fx;
  const bottom = c + (d - c) * fx;
  return top + (bottom - top) * fy;
}

/**
 * Onda de caracteres — canvas puro, nem a lib Motion nem nada de fora.
 *
 * A ESTRUTURA é uma onda: uma crista atravessa o campo da direita pra esquerda,
 * encurvada por um seno na vertical, e cada linha avança no seu próprio ritmo
 * (senão o campo inteiro desliza rígido, que lê como papel de parede rolando).
 * O caractere de cada célula troca quando a frente passa por cima dela.
 *
 * O CUSTO é baixo por três decisões:
 *  1. Redesenho SÓ DAS CÉLULAS QUE MUDARAM. Guardo o índice glifo+opacidade de
 *     cada célula; se não mudou, não há clearRect nem drawImage. Numa onda lenta
 *     isso é ~10% das células por quadro, não 100%.
 *  2. Os glifos vivem num atlas pré-renderizado com a opacidade assada no
 *     sprite — nada de fillText no laço, nenhuma troca de estado do contexto.
 *  3. 15fps e só 4 níveis de opacidade: quanto menos degrau, menos célula
 *     entra na conta do que mudou.
 *
 * Sem interação de cursor de propósito (pedido dela): fora o custo, ela obrigava
 * o campo a se redesenhar a cada movimento do mouse.
 *
 * A cor e a fonte vêm do CSS (`color` do canvas), então os temas de papel
 * (.rm[data-paper=...]) continuam mandando na tinta sem tocar no JS.
 */
export default function AsciiField({
  cell = 20,
  intensity = 0.5,
  className,
}: {
  cell?: number;
  intensity?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const parent = canvas.parentElement ?? canvas;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let dpr = 1;
    let tile = 0;
    let maxAlpha = 1;
    let ink = "#1C1B18";
    let atlas: HTMLCanvasElement | null = null;
    let previous = new Int32Array(0);
    let visible = true;
    let frame: number | null = null;
    let lastDraw = -Infinity;

    function buildAtlas(family: string) {
      tile = Math.ceil(cell * dpr);
      const sheet = document.createElement("canvas");
      sheet.width = tile * GLYPHS.length;
      sheet.height = tile * ALPHA_STEPS;
      const sheetCtx = sheet.getContext("2d");
      if (!sheetCtx) return;

      sheetCtx.font = `${(cell - 1) * dpr}px ${family}`;
      sheetCtx.textAlign = "center";
      sheetCtx.textBaseline = "middle";
      sheetCtx.fillStyle = ink;
      maxAlpha = Math.min(1, 0.9 * intensity);

      for (let step = 0; step < ALPHA_STEPS; step += 1) {
        sheetCtx.globalAlpha = (maxAlpha * (step + 1)) / ALPHA_STEPS;
        for (let glyph = 0; glyph < GLYPHS.length; glyph += 1) {
          sheetCtx.fillText(
            GLYPHS[glyph],
            glyph * tile + tile / 2,
            step * tile + tile / 2,
          );
        }
      }
      atlas = sheet;
    }

    function measure() {
      const rect = parent.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cols = Math.ceil(width / cell) + 1;
      rows = Math.ceil(height / cell) + 1;

      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      context!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const computed = getComputedStyle(canvas!);
      ink = computed.color || ink;
      buildAtlas(computed.fontFamily || "monospace");

      // Redimensionou: o canvas veio limpo, então todo mundo está sujo.
      previous = new Int32Array(cols * rows).fill(-1);
    }

    function draw(time: number) {
      if (!width || !height || !atlas) return;

      // Lento de propósito. É a frente da onda passando por cima da célula
      // que troca o caractere — não a célula piscando sozinha.
      const t = reduced ? 0 : time * 0.00006;

      for (let row = 0; row < rows; row += 1) {
        const rowBase = row * cell;

        // Termos que só dependem da linha — fora do laço interno.
        // O seno encurva a crista; a variação de ritmo evita que o campo
        // inteiro deslize rígido feito papel de parede.
        const curve = Math.sin(row * 0.075) * 1.6;
        const pace = 1 + Math.sin(row * 0.031 + 0.7) * 0.3;
        const phase = curve - t * 2.4 * pace;
        const noiseY = row * 0.042;

        for (let col = 0; col < cols; col += 1) {
          const front = col * 0.052 + phase;
          const wave = Math.sin(front);

          // Um só ruído, de frequência baixa: quebra a regularidade da onda
          // pra não virar listra de máquina, sem apagar a onda.
          const grain = noise(col * 0.030, noiseY, 7);
          const angle = wave * 2.2 + grain * 3.4;

          // Energia anda na mesma onda: as cruzes ficam nas cristas e a poeira
          // nos vales, então elas também formam faixas que atravessam.
          const energy = 0.5 + wave * 0.32 + (grain - 0.5) * 0.36;

          let glyph: number;
          if (energy < 0.24) {
            glyph = DUST[Math.floor(hash(col, row, 5) * DUST.length)];
          } else if (energy < 0.38) {
            glyph = CROSS;
          } else {
            glyph =
              Math.round(((((angle % Math.PI) + Math.PI) % Math.PI) / (Math.PI / 4))) % 4;
          }

          // Poucos degraus de opacidade = pouca célula entrando na lista do
          // que mudou. A variação forte fica por conta do glifo, não do tom.
          let bucket = Math.floor((0.45 + energy * 0.55) * ALPHA_STEPS);
          if (bucket < 0) bucket = 0;
          else if (bucket >= ALPHA_STEPS) bucket = ALPHA_STEPS - 1;

          // Só repinta o que mudou: sem isso, 100% das células por quadro.
          const index = row * cols + col;
          const key = glyph * ALPHA_STEPS + bucket;
          if (previous[index] === key) continue;
          previous[index] = key;

          const x = col * cell;
          context!.clearRect(x, rowBase, cell, cell);
          context!.drawImage(
            atlas,
            glyph * tile,
            bucket * tile,
            tile,
            tile,
            x,
            rowBase,
            cell,
            cell,
          );
        }
      }
    }

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(parent);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
      },
      { rootMargin: "80px" },
    );
    intersectionObserver.observe(parent);

    if (reduced) {
      frame = requestAnimationFrame(() => draw(0));
    } else {
      const loop = (time: number) => {
        frame = requestAnimationFrame(loop);
        if (!visible || time - lastDraw < FRAME_MS) return;
        lastDraw = time;
        draw(time);
      };
      frame = requestAnimationFrame(loop);
    }

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [cell, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "rm-field"}
      aria-hidden="true"
    />
  );
}
