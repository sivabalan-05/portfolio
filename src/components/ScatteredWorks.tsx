"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useT } from "@/i18n/LanguageContext";
import type { IndexItem } from "./EditorialIndex";

type DragState = {
  active: boolean;
  moved: boolean;
  pointerId: number;
  startX: number;
  startScrollLeft: number;
  lastX: number;
  lastTime: number;
  velocity: number;
};

/** Quanto tempo de deslize o impulso do arraste projeta à frente, em ms. */
const GLIDE_PROJECTION = 210;
/** Abaixo disso o gesto conta como parado: só encaixa no cartão mais próximo. */
const FLICK_THRESHOLD = .05;
/** Folga em px antes de um clique virar arraste. */
const DRAG_THRESHOLD = 3;

const styles = `
  .sw-gallery {
    position: relative;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow: hidden;
  }
  .sw__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.25rem;
    padding: 0 0 1.15rem;
  }
  .sw__hint {
    display: inline-flex;
    align-items: center;
    gap: .65rem;
    margin: 0;
    color: var(--ink);
    font-family: var(--font-subtitle), monospace;
    font-size: clamp(1rem, .92rem + .35vw, 1.2rem);
    font-weight: var(--offbit-weight);
    letter-spacing: var(--offbit-letter-spacing);
    text-transform: lowercase;
    opacity: .7;
  }
  .sw__hint-mark {
    display: inline-block;
    font-family: var(--font-mono), monospace;
    transition: transform var(--duration-normal) var(--ease-out);
  }
  .sw-gallery:hover .sw__hint-mark {
    transform: translateX(4px);
  }
  .sw__controls {
    display: flex;
    gap: .45rem;
    flex: 0 0 auto;
  }
  .sw__button {
    position: relative;
    isolation: isolate;
    display: inline-flex;
    min-width: var(--tap-min);
    min-height: var(--tap-min);
    align-items: center;
    justify-content: center;
    padding: .62rem .82rem;
    border: 1px solid var(--ink);
    background: var(--ink);
    color: var(--paper);
    font-family: var(--font-body);
    font-size: var(--type-label);
    font-weight: 600;
    line-height: 1;
    letter-spacing: .04em;
    text-decoration: none;
    text-transform: lowercase;
    cursor: pointer;
    transition:
      transform var(--duration-fast) var(--ease-out),
      opacity var(--duration-fast) var(--ease-out);
  }
  .sw__button:hover,
  .sw__button:focus-visible {
    transform: translateY(-2px);
  }
  .sw__button:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 3px;
  }
  .sw__button:disabled {
    opacity: .28;
    cursor: default;
    transform: none;
  }
  .sw__viewport {
    position: relative;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-inline: contain;
    scroll-snap-type: inline mandatory;
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, var(--ink) 72%, transparent) transparent;
    padding: .85rem 0 1.55rem;
    cursor: grab;
    -webkit-overflow-scrolling: touch;
  }
  .sw__viewport::-webkit-scrollbar {
    height: 6px;
  }
  .sw__viewport::-webkit-scrollbar-track {
    background: transparent;
  }
  .sw__viewport::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--ink) 72%, transparent);
    border-radius: 0;
  }
  /* Enquanto o arraste ou o deslize estão no comando, o encaixe do navegador
     sai da frente: quem posiciona é o JS, e ele termina em cima do ponto de
     encaixe — assim ligar o snap de volta não puxa a fita de repente. */
  .sw__viewport[data-dragging="true"],
  .sw__viewport[data-gliding="true"] {
    scroll-snap-type: none;
  }
  .sw__viewport[data-dragging="true"] {
    cursor: grabbing;
    user-select: none;
  }
  .sw__viewport:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: -2px;
  }
  .sw__track {
    display: flex;
    width: max-content;
    align-items: flex-start;
    gap: clamp(1.15rem, 2.1vw, 2.25rem);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .sw__item {
    flex: 0 0 clamp(18.5rem, 34vw, 31rem);
    min-width: 0;
    scroll-snap-align: start;
    scroll-snap-stop: normal;
  }
  .sw__link {
    position: relative;
    display: block;
    color: var(--ink);
    text-decoration: none;
    transform: translateY(0);
    transition: transform var(--duration-slow) var(--ease-out);
  }
  .sw__link::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    box-shadow: 0 18px 38px rgba(24, 22, 18, .2);
    opacity: 0;
    transition: opacity var(--duration-slow) var(--ease-out);
  }
  /* Moldura única para todos os cartões: as capas têm proporções diferentes
     (do pôster em pé da ondularis ao cartaz deitado do graduation) e, soltas,
     deixavam as legendas em alturas diferentes. Aqui cada capa entra inteira,
     como gravura em passe-partout, e a fita corre com uma linha de base só. */
  .sw__media {
    position: relative;
    display: block;
    overflow: hidden;
    aspect-ratio: 3 / 2;
    padding: clamp(.5rem, .85vw, .8rem);
    border: 1px solid color-mix(in srgb, var(--ink) 32%, transparent);
    background: color-mix(in srgb, var(--paper) 90%, var(--ink));
  }
  .sw__media::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background:
      linear-gradient(180deg, transparent 68%, rgba(18, 17, 14, .18)),
      url("/img/paper-noise.webp");
    background-size: 100% 100%, 150px 150px;
    mix-blend-mode: multiply;
    opacity: .22;
    transition: opacity var(--duration-normal) var(--ease-out);
  }
  .sw__image {
    object-fit: contain;
  }
  .sw__caption {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: .75rem;
    padding: .9rem 0 .2rem;
    border-top: 1px solid color-mix(in srgb, var(--ink) 32%, transparent);
  }
  .sw__num {
    font-family: var(--font-subtitle), monospace;
    font-size: clamp(1.25rem, 2vw, 1.75rem);
    font-weight: var(--offbit-weight-active);
    line-height: 1;
    letter-spacing: var(--offbit-letter-spacing);
    opacity: .62;
  }
  .sw__copy {
    min-width: 0;
  }
  .sw__title {
    display: block;
    overflow: hidden;
    font-family: var(--font-head);
    font-size: clamp(1.05rem, 1.5vw, 1.35rem);
    font-weight: 600;
    line-height: 1.08;
    letter-spacing: -.02em;
    text-overflow: ellipsis;
    text-transform: lowercase;
    white-space: nowrap;
  }
  .sw__tags {
    display: block;
    overflow: hidden;
    margin-top: .24rem;
    font-family: var(--font-body);
    font-size: var(--type-micro);
    line-height: 1.25;
    letter-spacing: .035em;
    opacity: .58;
    text-overflow: ellipsis;
    text-transform: lowercase;
    white-space: nowrap;
  }
  .sw__cta {
    gap: .3rem;
    min-height: 2.35rem;
    padding: .55rem .7rem;
    white-space: nowrap;
  }
  .sw__cta-arrow {
    display: inline-block;
    transition: transform var(--duration-normal) var(--ease-out);
  }
  @media (hover: hover) and (pointer: fine) {
    .sw__link:hover,
    .sw__link:focus-visible {
      transform: translateY(-6px);
    }
    .sw__link:hover::after,
    .sw__link:focus-visible::after {
      opacity: 1;
    }
    .sw__link:hover .sw__media::after,
    .sw__link:focus-visible .sw__media::after {
      opacity: .1;
    }
    .sw__link:hover .sw__cta-arrow,
    .sw__link:focus-visible .sw__cta-arrow {
      transform: translate(2px, -2px);
    }
  }
  .sw__link:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 6px;
  }
  .sw__endcap {
    display: flex;
    align-self: stretch;
    flex: 0 0 clamp(9rem, 16vw, 14rem);
    align-items: center;
    justify-content: center;
    border: 1px dashed color-mix(in srgb, var(--ink) 38%, transparent);
    color: var(--ink);
    font-family: var(--font-subtitle), monospace;
    font-size: clamp(1.1rem, 2vw, 1.6rem);
    letter-spacing: var(--offbit-letter-spacing);
    opacity: .58;
    text-align: center;
    text-transform: lowercase;
  }
  @media (max-width: 720px) {
    .sw__toolbar {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: flex-end;
    }
    .sw__hint {
      max-width: 12rem;
      line-height: 1.15;
    }
    .sw__item {
      flex-basis: min(80vw, 22rem);
    }
    .sw__viewport {
      padding-bottom: 1.55rem;
    }
    .sw__caption {
      grid-template-columns: auto minmax(0, 1fr);
    }
    .sw__cta {
      grid-column: 1 / -1;
      justify-self: start;
      margin-top: .15rem;
    }
    .sw__tags {
      white-space: normal;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .sw__viewport {
      scroll-behavior: auto;
    }
    .sw__hint-mark,
    .sw__button,
    .sw__link,
    .sw__link::after,
    .sw__media::after,
    .sw__cta-arrow {
      transition: none;
    }
    .sw-gallery:hover .sw__hint-mark,
    .sw__button:hover,
    .sw__button:focus-visible,
    .sw__link:hover,
    .sw__link:focus-visible,
    .sw__link:hover .sw__cta-arrow,
    .sw__link:focus-visible .sw__cta-arrow {
      transform: none;
    }
  }
`;

export default function ScatteredWorks({ items }: { items: IndexItem[] }) {
  const { lang } = useT();
  const viewportRef = useRef<HTMLDivElement>(null);
  const controlsRafRef = useRef(0);
  const glideRafRef = useRef(0);
  const suppressClickRef = useRef(false);
  const dragRef = useRef<DragState>({
    active: false,
    moved: false,
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  });
  const [dragging, setDragging] = useState(false);
  const [canPrevious, setCanPrevious] = useState(false);
  const [canNext, setCanNext] = useState(items.length > 1);

  const labels = {
    region: "horizontal gallery of selected work",
    hint: "drag or scroll to explore",
    previous: "previous projects",
    next: "next projects",
    open: "explore",
    end: "end of selection",
  };

  const updateControls = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const end = viewport.scrollWidth - viewport.clientWidth;
    setCanPrevious(viewport.scrollLeft > 2);
    setCanNext(viewport.scrollLeft < end - 2);
  }, []);

  const scheduleControlsUpdate = useCallback(() => {
    if (controlsRafRef.current) return;
    controlsRafRef.current = requestAnimationFrame(() => {
      controlsRafRef.current = 0;
      updateControls();
    });
  }, [updateControls]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(updateControls);
    observer.observe(viewport);
    updateControls();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(controlsRafRef.current);
      cancelAnimationFrame(glideRafRef.current);
    };
  }, [items.length, updateControls]);

  // `data-gliding` fica fora do JSX de propósito: o deslize roda dentro de um
  // requestAnimationFrame e o atributo precisa valer no mesmo quadro, antes do
  // navegador tentar encaixar a fita por conta própria.
  const stopGlide = useCallback(() => {
    if (viewportRef.current) viewportRef.current.dataset.gliding = "false";
    if (!glideRafRef.current) return;
    cancelAnimationFrame(glideRafRef.current);
    glideRafRef.current = 0;
  }, []);

  /** Onde cada cartão encosta na borda esquerda da janela. */
  const snapPoints = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return [];
    const origin = viewport.getBoundingClientRect().left;
    const end = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    return Array.from(
      viewport.querySelectorAll<HTMLElement>(".sw__item"),
      (item) => {
        const offset =
          viewport.scrollLeft + item.getBoundingClientRect().left - origin;
        return Math.min(Math.max(offset, 0), end);
      },
    );
  }, []);

  const nearestSnap = useCallback((position: number) => {
    const points = snapPoints();
    if (!points.length) return position;
    return points.reduce((closest, point) =>
      Math.abs(point - position) < Math.abs(closest - position) ? point : closest,
    );
  }, [snapPoints]);

  /** Leva a fita até o destino com desaceleração — nada de corte seco. */
  const glideTo = useCallback((target: number, duration: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    stopGlide();
    const from = viewport.scrollLeft;
    const distance = target - from;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || Math.abs(distance) < 1) {
      viewport.scrollLeft = target;
      scheduleControlsUpdate();
      return;
    }
    viewport.dataset.gliding = "true";
    let start = 0;
    const step = (now: number) => {
      if (!start) start = now;
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      viewport.scrollLeft = from + distance * eased;
      if (progress < 1) {
        glideRafRef.current = requestAnimationFrame(step);
        return;
      }
      glideRafRef.current = 0;
      viewport.dataset.gliding = "false";
      scheduleControlsUpdate();
    };
    glideRafRef.current = requestAnimationFrame(step);
  }, [scheduleControlsUpdate, stopGlide]);

  /** Um cartão por clique, em vez de uma distância arbitrária. */
  const scrollGallery = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    stopGlide();
    const points = snapPoints();
    const current = viewport.scrollLeft;
    const end = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const target =
      direction === 1
        ? points.find((point) => point > current + 4) ?? end
        : [...points].reverse().find((point) => point < current - 4) ?? 0;
    glideTo(target, 520);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    stopGlide();
    const viewport = event.currentTarget;
    dragRef.current = {
      active: true,
      moved: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: viewport.scrollLeft,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    const viewport = event.currentTarget;
    if (!drag.moved) {
      const delta = event.clientX - drag.startX;
      if (Math.abs(delta) <= DRAG_THRESHOLD) return;
      // Reancorar na borda da folga: o gesto vira arraste sem salto, e um
      // primeiro movimento largo não perde o caminho que já andou.
      drag.moved = true;
      drag.startX = drag.startX + Math.sign(delta) * DRAG_THRESHOLD;
      drag.startScrollLeft = viewport.scrollLeft;
      // A captura so entra aqui, depois do limiar. Ligada ja no pointerdown,
      // ela redirecionaria o pointerup e o click para este viewport e os
      // <Link> dos cards nunca receberiam o clique - a galeria parava de abrir
      // os projetos. Mesmo motivo do arrasto das etiquetas do hero.
      viewport.setPointerCapture(event.pointerId);
      // O atributo vai no DOM aqui mesmo, e nao so pelo estado do React: e ele
      // que desliga o scroll-snap: inline mandatory, e o snap precisa ja estar
      // desligado quando o scrollLeft logo abaixo for escrito. Esperando o
      // proximo render, o primeiro passo do arrasto voltava para o snap.
      viewport.dataset.dragging = "true";
      setDragging(true);
    }
    event.preventDefault();
    const elapsed = event.timeStamp - drag.lastTime;
    if (elapsed > 0) {
      const instant = (event.clientX - drag.lastX) / elapsed;
      drag.velocity = drag.velocity * .7 + instant * .3;
      drag.lastX = event.clientX;
      drag.lastTime = event.timeStamp;
    }
    viewport.scrollLeft = drag.startScrollLeft - (event.clientX - drag.startX);
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>, cancelled = false) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    const viewport = event.currentTarget;
    if (viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
    drag.active = false;
    setDragging(false);

    if (!cancelled && drag.moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }

    if (cancelled || !drag.moved) {
      scheduleControlsUpdate();
      return;
    }

    // Quem soltou parado não merece arremesso: só conta o impulso de quem
    // ainda estava movendo a mão no instante em que soltou.
    const stale = event.timeStamp - drag.lastTime > 70;
    const velocity = stale || Math.abs(drag.velocity) < FLICK_THRESHOLD
      ? 0
      : drag.velocity;
    const projected = viewport.scrollLeft - velocity * GLIDE_PROJECTION;
    const target = nearestSnap(projected);
    const distance = Math.abs(target - viewport.scrollLeft);
    glideTo(target, Math.min(760, Math.max(320, 260 + distance * .55)));
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    scrollGallery(event.key === "ArrowLeft" ? -1 : 1);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="sw-gallery">
        <div className="sw__toolbar">
          <p className="sw__hint" id="sw-drag-hint">
            <span>{labels.hint}</span>
            <span className="sw__hint-mark" aria-hidden="true">↔</span>
          </p>
          <div className="sw__controls">
            <button
              className="sw__button"
              type="button"
              aria-label={labels.previous}
              disabled={!canPrevious}
              onClick={() => scrollGallery(-1)}
            >
              <span aria-hidden="true">[ ← ]</span>
            </button>
            <button
              className="sw__button"
              type="button"
              aria-label={labels.next}
              disabled={!canNext}
              onClick={() => scrollGallery(1)}
            >
              <span aria-hidden="true">[ → ]</span>
            </button>
          </div>
        </div>

        <div
          className="sw__viewport"
          ref={viewportRef}
          role="region"
          aria-label={labels.region}
          aria-describedby="sw-drag-hint"
          tabIndex={0}
          data-dragging={dragging ? "true" : "false"}
          onScroll={scheduleControlsUpdate}
          onWheel={stopGlide}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={(event) => finishDrag(event)}
          onPointerCancel={(event) => finishDrag(event, true)}
          onClickCapture={handleClickCapture}
          onKeyDown={handleKeyDown}
          onDragStart={(event) => event.preventDefault()}
        >
          <ul className="sw__track">
            {items.map((item, index) => (
              <li className="sw__item" key={item.id ?? `${item.num}-${index}`}>
                <Link
                  className="sw__link hover-trigger"
                  href={item.href}
                  draggable={false}
                  data-cursor-label={`↗ ${item.num}`}
                >
                  <span className="sw__media">
                    <Image
                      className="sw__image"
                      src={item.img}
                      alt={item.title}
                      fill
                      sizes="(max-width: 720px) 82vw, (max-width: 1200px) 48vw, 528px"
                    />
                  </span>
                  <span className="sw__caption">
                    <span className="sw__num">{item.num}</span>
                    <span className="sw__copy">
                      <span className="sw__title">{item.title}</span>
                      <span className="sw__tags">{item.tags}</span>
                    </span>
                    <span className="sw__button sw__cta">
                      <span>{labels.open}</span>
                      <span className="sw__cta-arrow" aria-hidden="true">↗</span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
            <li className="sw__endcap" aria-hidden="true">
              [ {labels.end} ]
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
