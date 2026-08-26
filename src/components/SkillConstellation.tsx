"use client";

import { useState } from "react";

export type ConstellationNode = {
  label: string;
  detail: string;
};

export default function SkillConstellation({ nodes }: { nodes: ConstellationNode[] }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="rm-skills-index">
      <style>{`
        .rm-skills-index {
          width: 100%;
          font-family: var(--font-body);
          color: var(--ink);
        }
        .rm-skill-row {
          position: relative;
          padding: 1.15rem 0;
          cursor: crosshair;
        }
        .rm-skill-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: clamp(.68rem, .9vw, .95rem);
          text-transform: uppercase;
          letter-spacing: .08em;
        }
        .rm-skill-num {
          opacity: .4;
          margin-right: 1.25rem;
          font-family: var(--font-subtitle), monospace;
          font-variant-numeric: tabular-nums;
        }
        .rm-skill-label {
          font-weight: 600;
          transition: transform .25s cubic-bezier(.2, .8, .2, 1);
          display: inline-block;
        }
        .rm-skill-row:hover .rm-skill-label {
          transform: translateX(6px);
        }
        .rm-skill-icon {
          opacity: 0;
          transform: rotate(-90deg);
          transition: transform .3s ease, opacity .3s ease;
          font-size: .8rem;
        }
        .rm-skill-row:hover .rm-skill-icon,
        .rm-skill-row[data-open="true"] .rm-skill-icon {
          opacity: 1;
          transform: rotate(0deg);
        }
        .rm-skill-body {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height .35s cubic-bezier(.16, 1, .3, 1), opacity .25s ease;
        }
        .rm-skill-row[data-open="true"] .rm-skill-body {
          max-height: 8rem;
          opacity: 1;
        }
        .rm-skill-detail {
          padding: .75rem 0 0 2.8rem;
          font-family: var(--font-serif), serif;
          font-size: clamp(.9rem, 1.2vw, 1.15rem);
          opacity: .75;
          font-style: italic;
          line-height: 1.5;
        }
        .rm-skill-border {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: repeating-linear-gradient(
            90deg,
            color-mix(in srgb, var(--ink) 35%, transparent) 0 3px,
            transparent 3px 8px
          );
        }
        @media (max-width: 768px) {
          .rm-skill-detail {
            padding-left: 2rem;
            font-size: .95rem;
          }
        }
      `}</style>
      
      <div className="rm-skill-border" style={{ top: 0, bottom: "auto" }} />

      {nodes.map((item, i) => {
        const isOpen = active === i;
        const num = String(i + 1).padStart(2, "0");

        return (
          <div 
            key={item.label} 
            className="rm-skill-row"
            data-open={isOpen}
            tabIndex={0}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            onClick={() => setActive(isOpen ? null : i)}
          >
            <div className="rm-skill-header">
              <div>
                <span className="rm-skill-num">{num} /</span>
                <span className="rm-skill-label">{item.label}</span>
              </div>
              <span className="rm-skill-icon" aria-hidden="true">✳︎</span>
            </div>

            <div className="rm-skill-body" aria-hidden={!isOpen}>
              <div className="rm-skill-detail">{item.detail}</div>
            </div>

            <div className="rm-skill-border" />
          </div>
        );
      })}
    </div>
  );
}
