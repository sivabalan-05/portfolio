"use client";

import { useState } from "react";
import { useCreativeStudio } from "./CreativeStudio";

export type ConstellationNode = {
  label: string;
  detail: string;
};

export default function SkillConstellation({ nodes }: { nodes: ConstellationNode[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(0);
  const { playSound } = useCreativeStudio();

  const toggleRow = (idx: number) => {
    setActiveIdx((curr) => (curr === idx ? null : idx));
    playSound("hover");
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(6);
    }
  };

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
          padding: 1.1rem 0;
          cursor: pointer;
          transition: background-color .2s ease;
        }
        .rm-skill-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: clamp(.72rem, .95vw, .95rem);
          text-transform: uppercase;
          letter-spacing: .08em;
          z-index: 2;
        }
        .rm-skill-title {
          display: flex;
          align-items: baseline;
        }
        .rm-skill-number {
          opacity: .45;
          margin-right: 1.2rem;
          font-family: var(--font-subtitle), monospace;
          font-variant-numeric: tabular-nums;
          font-size: .85rem;
        }
        .rm-skill-label {
          font-weight: 600;
          transition: transform .3s cubic-bezier(.23, 1, .32, 1);
          display: inline-block;
        }
        .rm-skill-row:hover .rm-skill-label {
          transform: translateX(6px);
        }
        .rm-skill-meta-right {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .rm-skill-cue {
          display: none;
          font-family: var(--font-mono), monospace;
          font-size: .64rem;
          letter-spacing: .04em;
          text-transform: lowercase;
          opacity: .55;
        }
        .rm-skill-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono), monospace;
          font-size: .82rem;
          transition: transform .3s cubic-bezier(.23, 1, .32, 1);
          opacity: .65;
        }
        .rm-skill-row[data-open="true"] .rm-skill-icon {
          transform: rotate(45deg);
          opacity: 1;
          color: var(--site-accent, #1C1B18);
        }
        .rm-skill-detail-wrapper {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height .35s cubic-bezier(.23, 1, .32, 1), opacity .25s ease;
        }
        .rm-skill-row[data-open="true"] .rm-skill-detail-wrapper {
          max-height: 8rem;
          opacity: 1;
        }
        .rm-skill-detail {
          padding: .65rem 0 0 2.6rem;
          font-family: var(--font-serif), serif;
          font-size: clamp(.9rem, 1.2vw, 1.12rem);
          opacity: .82;
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
        @media (max-width: 768px) {
          .rm-skill-cue { display: inline-block; }
          .rm-skill-detail { padding-left: 2rem; font-size: .92rem; }
          .rm-skill-row { padding: .9rem 0; }
        }
      `}</style>
      
      <div className="rm-skill-divider" style={{ top: 0, bottom: "auto" }} />

      {nodes.map((node, i) => {
        const isOpen = activeIdx === i;
        const num = String(i + 1).padStart(2, "0");
        
        return (
          <div 
            key={node.label} 
            className="rm-skill-row"
            data-open={isOpen}
            tabIndex={0}
            onMouseEnter={() => setActiveIdx(i)}
            onFocus={() => setActiveIdx(i)}
            onClick={() => toggleRow(i)}
          >
            <div className="rm-skill-header">
              <div className="rm-skill-title">
                <span className="rm-skill-number">{num} /</span>
                <span className="rm-skill-label">{node.label}</span>
              </div>
              <div className="rm-skill-meta-right">
                <span className="rm-skill-cue">{isOpen ? "[ active ]" : "[ tap ]"}</span>
                <span className="rm-skill-icon">{isOpen ? "✕" : "+"}</span>
              </div>
            </div>

            <div className="rm-skill-detail-wrapper" aria-hidden={!isOpen}>
              <div className="rm-skill-detail">{node.detail}</div>
            </div>

            <div className="rm-skill-divider" />
          </div>
        );
      })}
    </div>
  );
}
