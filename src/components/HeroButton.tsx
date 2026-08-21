"use client";

import Link from "next/link";
import React from "react";

const styles = `
.hero-btn {
  --btn-bg: var(--ink);
  --btn-border: var(--ink);
  --btn-text: var(--paper);
  --btn-hover-bg: var(--blue, #DCF0FF);
  --btn-hover-text: var(--ink);
  
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6em 1em;
  border: 4px solid var(--btn-border);
  background-color: var(--btn-bg);
  color: var(--btn-text);
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.3s ease-in-out, background-color 0.3s ease-in-out, border-color 0.3s ease-in-out, color 0.3s ease-in-out;
  overflow: visible;
}

.hero-btn:hover, .hero-btn:focus-visible {
  transform: scale(1.1) rotate(5deg);
  background-color: var(--btn-hover-bg);
  border-color: var(--btn-hover-bg);
  color: var(--btn-hover-text);
}

.hero-btn p {
  display: inline-block;
  margin: 0;
  position: relative;
  color: inherit;
}

.hero-btn p::after {
  position: absolute;
  content: "";
  width: 0;
  left: 0;
  bottom: -2px; 
  background: var(--btn-hover-text);
  height: 2px; 
  transition: 0.3s ease-out;
}.hero-btn:hover p::after, .hero-btn:focus-visible p::after {
  width: 100%;
}

.hero-btn:focus-visible {
  outline: none;
}
`;

export default function HeroButton({
  children,
  href,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  className?: string;
}) {
  const content = (
    <p>{children}</p>
  );

  if (href) {
    if (href.startsWith("#")) {
      return (
        <a href={href} onClick={onClick} className={`hero-btn hover-trigger ${className}`}>
          <style>{styles}</style>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={`hero-btn hover-trigger ${className}`} onClick={onClick}>
        <style>{styles}</style>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`hero-btn hover-trigger ${className}`}>
      <style>{styles}</style>
      {content}
    </button>
  );
}
