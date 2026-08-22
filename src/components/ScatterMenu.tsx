"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import HeroButton from "./HeroButton";
import { useCreativeStudio } from "./CreativeStudio";

/**
 * Scatter Navigation Menu:
 * Interactive tags scattered dynamically across the hero with physics and parallax.
 * Transitions seamlessly into a fixed corner cluster upon scrolling past the hero.
 */

export type MenuItem = {
  label: string;
  href: string;        // "#anchor" or "/route"
  left: string;        // Layout position inside hero
  top: string;
  rotate: number;
  priority: "primary" | "secondary" | "tertiary";
  previews?: { src: string; alt: string }[];
};

const styles = `
  .sm__tag-wrapper {
    position: absolute;
    z-index: 25;
    display: inline-block;
    cursor: grab;
    touch-action: none;
    user-select: none;
    will-change: translate;
  }
  .sm__tag-wrapper[data-dragging="true"] {
    z-index: 30;
    cursor: grabbing;
  }
  .sm__tag-wrapper:focus-within {
    outline: 2px dotted var(--site-ink);
    outline-offset: 4px;
  }
  .sm__label {
    font-family: var(--font-subtitle), monospace;
    font-size: .95rem;
    font-weight: var(--offbit-weight-active);
    text-transform: lowercase;
    letter-spacing: var(--offbit-letter-spacing);
  }
  .sm__label {
    display: inline-flex;
    align-items: center;
    gap: .42rem;
  }
  .sm__tag--hero {
    opacity: var(--tag-opacity, .8);
    transform: rotate(var(--tag-rotate, 0deg));
    animation: sm-tag-in .45s cubic-bezier(.16, 1, .3, 1) var(--tag-delay, 1.3s) both;
    transition:
      opacity .3s ease,
      transform .35s cubic-bezier(.16, 1, .3, 1);
  }
  .sm__tag--hero[data-pinned="true"] {
    opacity: 0;
    transform: scale(.6) rotate(var(--tag-rotate, 0deg));
    pointer-events: none;
  }
  @keyframes sm-tag-in {
    from { opacity: 0; transform: scale(.5) rotate(var(--tag-rotate, 0deg)); }
    to { opacity: var(--tag-opacity, .8); transform: scale(1) rotate(var(--tag-rotate, 0deg)); }
  }
  .sm__tag[data-priority="primary"] {
    font-family: var(--font-subtitle), monospace;
    font-size: 1.18rem;
    font-weight: var(--offbit-weight-active);
    letter-spacing: var(--offbit-letter-spacing);
    padding: .75rem 1.45rem;
    box-shadow:
      0 0 0 8px color-mix(in srgb, var(--paper) 86%, transparent),
      7px 7px 0 color-mix(in srgb, var(--ink) 20%, transparent);
  }
  .sm__tag[data-priority="primary"]::after { content: " ↘"; }
  .sm__portal {
    position: absolute;
    top: calc(100% + .8rem);
    right: 0;
    width: min(22rem, 52vw);
    height: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3px;
    padding: 0;
    overflow: hidden;
    opacity: 0;
    background: var(--paper);
    box-shadow: 7px 8px 0 color-mix(in srgb, var(--ink) 15%, transparent);
    transform: scaleY(.15);
    transform-origin: top;
    transition: height .42s cubic-bezier(.16,1,.3,1), opacity .25s ease, transform .42s cubic-bezier(.16,1,.3,1), padding .42s cubic-bezier(.16,1,.3,1);
  }
  .sm__portal-frame {
    position: relative;
    min-width: 0;
    overflow: hidden;
    filter: grayscale(1) contrast(1.08);
  }
  .sm__portal-frame img { object-fit: cover; }
  .sm__tag[data-priority="primary"]:hover .sm__portal,
  .sm__tag[data-priority="primary"]:focus-visible .sm__portal {
    height: 7rem;
    padding: 4px;
    opacity: 1;
    transform: scaleY(1);
  }
  .sm__tag[data-priority="secondary"] {
    font-size: 1.02rem;
    padding: .62rem 1.25rem;
    opacity: .95;
    box-shadow:
      0 0 0 5px color-mix(in srgb, var(--paper) 70%, transparent),
      5px 5px 0 color-mix(in srgb, var(--ink) 16%, transparent);
  }
  .sm__tag[data-priority="tertiary"] {
    font-size: .95rem;
    padding: .58rem 1.18rem;
    opacity: .88;
    box-shadow:
      0 0 0 4px color-mix(in srgb, var(--paper) 62%, transparent),
      4px 4px 0 color-mix(in srgb, var(--ink) 13%, transparent);
  }
  .sm__cluster {
    position: fixed;
    right: 1.2rem;
    /* Layered above floating back-to-top button */
    bottom: 5.5rem;
    z-index: 900;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: .45rem;
    animation: sm-cluster-in .4s cubic-bezier(.16, 1, .3, 1) both;
  }
  .sm__cluster > .sm__tag-wrapper {
    animation: sm-cluster-item-in .3s cubic-bezier(.16, 1, .3, 1) var(--tag-delay, 0s) both;
  }
  @keyframes sm-cluster-in {
    from { opacity: 0; transform: translateX(40px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes sm-cluster-item-in {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: var(--tag-opacity, .8); transform: translateX(0) rotate(var(--tag-rotate, 0deg)); }
  }
  .sm__cluster .sm__tag {
    position: static;
    animation: none;
    min-height: var(--tap-min);
    display: inline-flex;
    align-items: center;
    font-size: var(--type-micro);
    padding: .58rem .75rem;
  }
  .sm__cluster .sm__tag[data-priority="primary"] {
    order: -1;
    font-size: var(--type-micro);
    box-shadow:
      0 0 0 4px color-mix(in srgb, var(--paper) 74%, transparent),
      3px 3px 0 color-mix(in srgb, var(--ink) 14%, transparent);
  }
  .sm__cluster .sm__portal { display: none; }
  @media (max-width: 768px) {
    .sm__hero-group {
      position: relative;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1.25rem 0 0.5rem;
      z-index: 25;
      width: 100%;
    }
    .sm__tag-wrapper.sm__tag--hero {
      position: relative !important;
      left: auto !important;
      top: auto !important;
      right: auto !important;
      bottom: auto !important;
      transform: none !important;
      translate: none !important;
      display: inline-flex !important;
      visibility: visible !important;
      animation: none !important;
      margin: 0 !important;
    }
    .sm__tag {
      font-size: var(--type-micro);
      padding: .48rem .65rem;
    }
    .sm__label {
      white-space: nowrap;
      font-size: 0.86rem;
    }
    .sm__portal {
      display: none !important;
    }
    /* Fixed vertical stack dock on mobile — exact same as desktop */
    .sm__cluster {
      position: fixed;
      right: 0.85rem;
      bottom: 4.8rem;
      z-index: 900;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: .38rem;
      background: none !important;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      width: auto !important;
      max-width: none !important;
      overflow: visible !important;
      padding: 0 !important;
      left: auto !important;
      translate: none !important;
    }
    .sm__cluster::-webkit-scrollbar { display: none; }
    .sm__cluster .sm__tag-wrapper {
      position: relative !important;
      display: inline-block !important;
      transform: rotate(var(--tag-rotate, 0deg)) !important;
      width: auto !important;
      margin: 0 !important;
    }
    .sm__cluster .sm__tag {
      width: auto !important;
      font-size: var(--type-micro);
      padding: .46rem .62rem;
      box-shadow: 2px 2px 0 color-mix(in srgb, var(--ink) 14%, transparent);
      border: none;
      display: inline-flex;
      align-items: center;
    }
    .sm__cluster .sm__tag[data-priority="primary"] {
      order: -1;
      box-shadow:
        0 0 0 3px color-mix(in srgb, var(--paper) 74%, transparent),
        2px 2px 0 color-mix(in srgb, var(--ink) 14%, transparent);
    }
    .sm__cluster .sm__label {
      white-space: nowrap;
      font-size: 0.82rem;
      text-align: right;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .sm__tag { transition: none; }
  }
`;

function go(e: React.MouseEvent<HTMLElement>, href: string) {
  if (href.startsWith("#")) {
    e.preventDefault();
    if (href === "#about") window.dispatchEvent(new Event("studio:reveal-about"));
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  }
  // Direct route navigation transition
}

function DraggableHeroTag({
  item,
  index,
  pinned,
}: {
  item: MenuItem;
  index: number;
  pinned: boolean;
}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const { markMoved, playSound, resetToken } = useCreativeStudio();

  useEffect(() => {
    offsetRef.current = { x: 0, y: 0 };
    if (elementRef.current) elementRef.current.style.translate = "";
  }, [resetToken]);

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.dataset.dragging = "false";
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (drag.moved) {
      suppressClickRef.current = true;
      markMoved();
      playSound("drag");
    }
  };

  return (
    <div
      ref={elementRef}
      className="sm__tag-wrapper sm__tag--hero"
      /* Viewport layout priority rules */
      data-priority={item.priority}
      data-pinned={pinned ? "true" : "false"}
      data-dragging="false"
      data-no-stamp
      style={{
        left: item.left,
        top: item.top,
        "--tag-opacity": item.priority === "primary" ? 1 : item.priority === "secondary" ? .92 : .78,
        "--tag-rotate": `${item.rotate}deg`,
        "--tag-delay": `${1.3 + index * .12}s`,
      } as React.CSSProperties}
      onPointerDown={(event) => {
        if (pinned || event.button !== 0 || window.innerWidth <= 720) return;
        const element = elementRef.current;
        const hero = element?.closest<HTMLElement>(".ph");
        if (!element || !hero) return;
        const rect = element.getBoundingClientRect();
        const bounds = hero.getBoundingClientRect();
        dragRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          minX: bounds.left - rect.left,
          maxX: bounds.right - rect.right,
          minY: bounds.top - rect.top,
          maxY: bounds.bottom - rect.bottom,
          moved: false,
        };
        suppressClickRef.current = false;
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        const element = elementRef.current;
        if (!drag || drag.pointerId !== event.pointerId || !element) return;
        const deltaX = event.clientX - drag.startX;
        const deltaY = event.clientY - drag.startY;
        if (!drag.moved && Math.hypot(deltaX, deltaY) < 4) return;
        if (!drag.moved) {
          /* Pointer gesture capture threshold prevents blocking genuine click events */
          drag.moved = true;
          element.dataset.dragging = "true";
          element.setPointerCapture(event.pointerId);
        }
        const x = offsetRef.current.x + Math.min(drag.maxX, Math.max(drag.minX, deltaX));
        const y = offsetRef.current.y + Math.min(drag.maxY, Math.max(drag.minY, deltaY));
        element.style.translate = `${x}px ${y}px`;
      }}
      onPointerUp={(event) => {
        const drag = dragRef.current;
        if (drag?.moved) {
          const deltaX = event.clientX - drag.startX;
          const deltaY = event.clientY - drag.startY;
          offsetRef.current = {
            x: offsetRef.current.x + Math.min(drag.maxX, Math.max(drag.minX, deltaX)),
            y: offsetRef.current.y + Math.min(drag.maxY, Math.max(drag.minY, deltaY)),
          };
        }
        finishDrag(event);
      }}
      onPointerCancel={finishDrag}
    >
      <HeroButton
        href={item.href}
        onClick={(event) => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false;
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          go(event, item.href);
        }}
        className="sm__label"
      >
        {`[ ${item.label} ]`}
      </HeroButton>
      {item.previews?.length ? (
        <span className="sm__portal" aria-hidden="true">
          {item.previews.slice(0, 3).map((preview) => (
            <span className="sm__portal-frame" key={preview.src}>
              <Image src={preview.src} alt="" fill sizes="120px" />
            </span>
          ))}
        </span>
      ) : null}
    </div>
  );
}

export default function ScatterMenu({ items }: { items: MenuItem[] }) {
  const [pinned, setPinned] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  // Fixed cluster mode activated once scrolled beyond the hero
  useEffect(() => {
    const onScroll = () => setPinned(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const footer = document.querySelector("#contact");
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: .02 },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="menu">
      <style>{styles}</style>

      {/* Scattered hero tags */}
      <div className="sm__hero-group">
        {items.map((it, i) => (
          <DraggableHeroTag
            key={it.label}
            item={it}
            index={i}
            pinned={pinned}
          />
        ))}
      </div>

      {/* Corner dock cluster once hero is out of view */}
      {pinned && !footerVisible && (
          <div
            className="sm__cluster"
          >
            {items.map((it, i) => (
              <div
                key={it.label}
                className="sm__tag-wrapper"
                style={{
                  position: "relative",
                  display: "inline-block",
                  "--tag-opacity": it.priority === "primary" ? 1 : it.priority === "secondary" ? .92 : .78,
                  "--tag-rotate": `${i % 2 ? 2 : -2}deg`,
                  "--tag-delay": `${i * .06}s`,
                } as React.CSSProperties}
              >
                <HeroButton href={it.href} onClick={(e) => go(e, it.href)} className="sm__label">
                  {`[ ${it.label} ]`}
                </HeroButton>
              </div>
            ))}
          </div>
      )}
    </nav>
  );
}
