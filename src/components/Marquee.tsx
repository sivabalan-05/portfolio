"use client";

import { useEffect, useRef } from "react";

const ORNAMENT = "⋆ ˚｡⋆୨♡୧⋆ ˚｡⋆  ".repeat(24);

const styles = `
  .mq-frame {
    position: relative;
    z-index: 3;
    overflow: hidden;
    background: var(--acid);
    color: var(--paper);
    margin-top: calc(0px - var(--hero-art-lift, 0px));
    padding: .72rem 0;
    isolation: isolate;
  }
  .mq__ornament {
    position: absolute;
    left: 0;
    right: 0;
    z-index: 2;
    overflow: hidden;
    font-family: var(--font-mono), monospace;
    font-size: clamp(.48rem, .62vw, .66rem);
    line-height: 1;
    letter-spacing: .08em;
    text-align: center;
    white-space: nowrap;
    opacity: .58;
    pointer-events: none;
    user-select: none;
  }
  .mq__ornament--top {
    top: .08rem;
  }
  .mq__ornament--bottom {
    bottom: .08rem;
    transform: rotate(180deg);
  }
  .mq {
    overflow: hidden;
    padding: .88rem 0 .84rem;
  }
  .mq__track {
    position: relative;
    z-index: 1;
    display: flex;
    width: max-content;
    animation: mq-roll 32s linear infinite;
    will-change: transform;
  }
  .mq__group {
    display: flex;
    flex: 0 0 auto;
  }
  .mq__item {
    display: inline-flex;
    align-items: center;
    font-family: var(--font-subtitle), monospace;
    font-size: clamp(1.1rem, 2.4vw, 2rem);
    font-weight: var(--offbit-weight-active);
    letter-spacing: var(--offbit-letter-spacing);
    text-transform: lowercase;
    white-space: nowrap;
  }
  .mq__star {
    display: inline-grid;
    place-items: center;
    margin-inline: clamp(1.05rem, 1.45vw, 1.45rem);
    color: var(--hero-highlight, #75332f);
    font-size: .82em;
    line-height: 1;
    opacity: .92;
    transform: translateY(.02em);
  }
  @keyframes mq-roll {
    to { transform: translate3d(-50%, 0, 0); }
  }
  @media (hover: hover) {
    .mq-frame:hover .mq__track { animation-play-state: paused; }
  }
  .mq-frame[data-visible="false"] .mq__track {
    animation-play-state: paused;
  }
  @media (max-width: 640px) {
    .mq-frame { padding-block: .62rem; }
    .mq__ornament { font-size: .46rem; }
    .mq { padding-block: .78rem .75rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    .mq__track { animation: none; transform: none; }
    .mq__group:nth-child(2) { display: none; }
  }
`;

export default function Marquee({ items }: { items: string[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        root.dataset.visible = entry.isIntersecting ? "true" : "false";
      },
      { rootMargin: "120px" },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{styles}</style>
      <div ref={rootRef} className="mq-frame" data-visible="true" aria-hidden="true">
        <div className="mq__ornament mq__ornament--top">{ORNAMENT}</div>
        <div className="mq">
          <div className="mq__track">
            {[0, 1].map((group) => (
              <div className="mq__group" key={group}>
                {items.map((item, index) => (
                  <span className="mq__item" key={`${group}-${item}-${index}`}>
                    {item}<span className="text-star mq__star">✳︎</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mq__ornament mq__ornament--bottom">{ORNAMENT}</div>
      </div>
    </>
  );
}
