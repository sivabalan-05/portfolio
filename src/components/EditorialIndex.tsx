"use client";
import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useVelocity } from "framer-motion";
import SpyImage from "./SpyImage";
import { PIXEL_CLIP } from "./PlaygroundHero";

export type IndexItem = {
  id?: string;
  num: string;
  title: string;
  tags: string;
  href: string;
  img: string;
  impact: string;
  ratio: number;
  githubUrl?: string;
  liveUrl?: string;
  description?: string;
  technologies?: string[];
  tagline?: string;
};

// Tamanho da imagem que segue o cursor (usado também para centralizá-la no ponteiro).
const PREVIEW_W = 300;
const PREVIEW_H = 380;

const styles = `
  .ei-row {
    display: grid;
    grid-template-columns: 4.5rem 1fr auto;
    align-items: baseline;
    gap: 1.5rem;
    padding: 1.6rem 0;
    /* separador "pixelado": blocos de 6px em vez de fio contínuo */
    background-image: repeating-linear-gradient(90deg, var(--ink) 0 6px, transparent 6px 12px);
    background-size: 100% 2px;
    background-position: top left;
    background-repeat: no-repeat;
    text-decoration: none;
    color: var(--ink);
    transition: opacity .35s ease, padding-left .45s cubic-bezier(.16,1,.3,1);
  }
  .ei-row:last-child {
    background-image:
      repeating-linear-gradient(90deg, var(--ink) 0 6px, transparent 6px 12px),
      repeating-linear-gradient(90deg, var(--ink) 0 6px, transparent 6px 12px);
    background-size: 100% 2px, 100% 2px;
    background-position: top left, bottom left;
    background-repeat: no-repeat, no-repeat;
  }
  .ei-row:hover { padding-left: 1.4rem; }
  .ei-title {
    font-family: var(--font-grotesk);
    font-size: clamp(2rem, 7vw, 5.5rem);
    line-height: .92;
    letter-spacing: -0.04em;
    text-transform: lowercase;
    font-weight: 700;
  }
  .ei-num, .ei-tags {
    font-family: var(--font-mono);
    font-size: .7rem;
    text-transform: uppercase;
    letter-spacing: .16em;
  }
  .ei-tags { text-align: right; white-space: nowrap; }

  @media (max-width: 720px) {
    .ei-row { grid-template-columns: 2.5rem 1fr; gap: .8rem; padding: 1.1rem 0; }
    .ei-tags { display: none; }
    .ei-row:hover { padding-left: 0; }
  }
`;

export default function EditorialIndex({ items }: { items: IndexItem[] }) {
  const [active, setActive] = useState<number | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 260, damping: 32, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 260, damping: 32, mass: 0.6 });

  // A imagem inclina de acordo com a velocidade horizontal — dá peso ao movimento.
  const vx = useVelocity(sx);
  const rotate = useTransform(vx, [-1400, 0, 1400], [-13, 0, 13], { clamp: true });

  const track = (e: React.MouseEvent) => {
    mx.set(e.clientX - PREVIEW_W / 2);
    my.set(e.clientY - PREVIEW_H / 2);
  };

  return (
    <>
      <style>{styles}</style>

      <div onMouseMove={track} onMouseLeave={() => setActive(null)}>
        {items.map((item, i) => (
          <a
            key={item.href}
            href={item.href}
            className="ei-row hover-trigger"
            data-cursor-label={item.title}
            onMouseEnter={(e) => {
              // Posiciona a imagem já sob o cursor antes de aparecer, evitando o "voo" inicial.
              mx.jump(e.clientX - PREVIEW_W / 2);
              my.jump(e.clientY - PREVIEW_H / 2);
              setActive(i);
            }}
            style={{ opacity: active !== null && active !== i ? 0.25 : 1 }}
          >
            <span className="ei-num">{item.num}</span>
            <span className="ei-title">{item.title}</span>
            <span className="ei-tags">{item.tags}</span>
          </a>
        ))}
      </div>

      {/* Imagem que persegue o cursor */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x: sx,
          y: sy,
          rotate,
          width: PREVIEW_W,
          height: PREVIEW_H,
          pointerEvents: "none",
          zIndex: 60,
        }}
      >
        <AnimatePresence>
          {active !== null && (
            <motion.div
              key={items[active].href}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: "100%", height: "100%", clipPath: PIXEL_CLIP }}
            >
              {/* câmera de vigilância detectando o projeto — conexão com o TCC dela */}
              <SpyImage
                src={items[active].img}
                tag={items[active].href.split("/").pop() ?? "projeto"}
                camLabel={`cam 0${active + 1}`}
                width={PREVIEW_W}
                height={PREVIEW_H}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
