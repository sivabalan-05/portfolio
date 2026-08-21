"use client";

import { useState } from "react";

export type ConstellationNode = {
  label: string;
  detail: string;
};

interface Props {
  nodes: ConstellationNode[];
}

export default function SkillConstellation({ nodes }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="rm-skills-index">
      <style>{`
        .rm-skills-index {
          display: flex;
          flex-direction: column;
          width: 100%;
          font-family: var(--font-body);
          color: var(--ink);
        }
        
        .rm-skill-row {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 1.2rem 0;
          cursor: crosshair;
        }

        .rm-skill-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: clamp(.65rem, .9vw, .95rem);
          text-transform: uppercase;
          letter-spacing: .08em;
          z-index: 2;
        }

        .rm-skill-title {
          display: flex;
          align-items: baseline;
        }

        .rm-skill-number {
          opacity: 0.4;
          margin-right: 1.5rem;
          font-family: var(--font-subtitle), monospace;
          font-variant-numeric: tabular-nums;
        }

        .rm-skill-label {
          font-weight: 600;
          transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          display: inline-block;
        }
        
        .rm-skill-row:hover .rm-skill-label {
          transform: translateX(8px);
        }

        .rm-skill-icon {
          opacity: 0;
          transform: rotate(-90deg);
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          font-size: 0.8rem;
        }

        .rm-skill-row:hover .rm-skill-icon {
          opacity: 1;
          transform: rotate(0deg);
        }

        .rm-skill-detail-wrapper {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition:
            max-height .4s cubic-bezier(.23, 1, .32, 1),
            opacity .3s ease;
        }

        .rm-skill-row[data-open="true"] .rm-skill-detail-wrapper {
          max-height: 8rem;
          opacity: 1;
        }

        .rm-skill-detail {
          padding-top: 0.8rem;
          padding-left: 3rem;
          font-family: var(--font-serif), serif;
          font-size: clamp(.9rem, 1.2vw, 1.15rem);
          text-transform: none;
          letter-spacing: normal;
          opacity: 0.75;
          font-style: italic;
          line-height: 1.5;
        }

        .rm-skill-divider {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: repeating-linear-gradient(
            to right,
            color-mix(in srgb, var(--ink) 35%, transparent),
            color-mix(in srgb, var(--ink) 35%, transparent) 3px,
            transparent 3px,
            transparent 8px
          );
        }
      `}</style>
      
      {/* Top divider */}
      <div className="rm-skill-divider" style={{ top: 0, bottom: 'auto' }} />

      {nodes.map((node, i) => {
        const isHovered = hoveredIndex === i;
        const number = (i + 1).toString().padStart(2, "0");
        
        return (
          <div 
            key={i} 
            className="rm-skill-row"
            data-open={isHovered ? "true" : "false"}
            tabIndex={0}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onFocus={() => setHoveredIndex(i)}
            onBlur={() => setHoveredIndex(null)}
            onClick={() => setHoveredIndex(isHovered ? null : i)}
          >
            <div className="rm-skill-header">
              <div className="rm-skill-title">
                <span className="rm-skill-number">{number} /</span>
                <span className="rm-skill-label">{node.label}</span>
              </div>
              <span className="rm-skill-icon">✳︎</span>
            </div>

            <div className="rm-skill-detail-wrapper" aria-hidden={!isHovered}>
              <div className="rm-skill-detail">
                {node.detail}
              </div>
            </div>

            <div className="rm-skill-divider" />
          </div>
        );
      })}
    </div>
  );
}
