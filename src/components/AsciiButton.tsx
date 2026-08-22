"use client";

import React from "react";
import Link from "next/link";

interface AsciiButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

const styles = `
.ascii-btn-wrapper {
  display: inline-flex;
}

.ascii-btn {
  --btn-color: var(--site-ink, #1C1B18);
  --btn-hover-bg: var(--acid, #a3e635);
  --btn-hover-color: #ffffff;
  --btn-border: var(--acid, #a3e635); /* Brand acid accent color */
  --btn-transition: ease-in-out 0.3s;
  --btn-anim-duration: 1.2s;
  
  box-sizing: border-box;
  padding: 0.6em 1em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--btn-color);
  font-family: var(--font-mono), monospace;
  font-weight: bolder;
  font-size: 16px;
  background-color: transparent;
  border: 4px solid var(--btn-border);
  cursor: pointer;
  transition: var(--btn-transition);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.1rem;
}

.ascii-btn:hover, .ascii-btn:focus-visible {
  transform: scale(1.2) rotate(10deg);
  background-color: var(--btn-hover-bg);
  color: var(--btn-hover-color);
  border-color: var(--btn-hover-bg);
  outline: none;
}

.ascii-btn-inner {
  position: relative;
  /* Matches button background during glitch transition */
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ascii-btn:hover .ascii-btn-inner, 
.ascii-btn:focus-visible .ascii-btn-inner {
  background: var(--btn-hover-bg);
}

.ascii-btn-inner::before {
  box-sizing: border-box;
  position: absolute;
  content: "";
  background: inherit;
  color: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 110%; /* Ensures complete coverage over original label */
  height: 110%;
  pointer-events: none;
  opacity: 0;
  white-space: nowrap;
}

.ascii-btn:hover .ascii-btn-inner::before, 
.ascii-btn:focus-visible .ascii-btn-inner::before {
  opacity: 1;
  animation: ascii-chitchat linear both var(--btn-anim-duration);
}

@keyframes ascii-chitchat {
  0% { content: "▒░▓"; }
  10% { content: "✦✧⋆"; }
  20% { content: "≈°⊹"; }
  30% { content: "·⠂⠁"; }
  40% { content: "✿₊˚"; }
  50% { content: "✳░▒"; }
  60% { content: "▓≈°"; }
  70% { content: "⊹·⠂"; }
  80% { content: "⠁✿₊"; }
  90% { content: "˚✳✦"; }
  100% { content: ""; opacity: 0; } /* Fades out to reveal original label */
}
`;

export default function AsciiButton({ children, href, onClick, className = "" }: AsciiButtonProps) {
  const inner = (
    <span className="ascii-btn-inner">
      {children}
    </span>
  );

  if (href) {
    return (
      <div className={`ascii-btn-wrapper ${className}`}>
        <style>{styles}</style>
        <Link href={href} className="ascii-btn hover-trigger">
          {inner}
        </Link>
      </div>
    );
  }

  return (
    <div className={`ascii-btn-wrapper ${className}`}>
      <style>{styles}</style>
      <button type="button" onClick={onClick} className="ascii-btn hover-trigger">
        {inner}
      </button>
    </div>
  );
}
