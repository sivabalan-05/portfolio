"use client";

import Link from "next/link";
import React from "react";

const styles = `
.ul-btn {
  --primary-color: var(--site-ink, #1C1B18);
  --hovered-color: var(--acid, #a3e635);
  position: relative;
  display: inline-flex;
  font-weight: 600;
  gap: 0.5rem;
  align-items: center;
  text-decoration: none;
  cursor: pointer;
  border: none;
  background: none;
  padding: 0;
  margin: 0;
}

.ul-btn p {
  margin: 0;
  position: relative;
  color: var(--primary-color);
  /* Inherit font sizing from the parent to be flexible */
  font-size: inherit;
  font-family: inherit;
  font-weight: inherit;
  text-transform: inherit;
  letter-spacing: inherit;
}

.ul-btn::after {
  position: absolute;
  content: "";
  width: 0;
  left: 0;
  bottom: -4px;
  background: var(--hovered-color);
  height: 2px;
  transition: 0.3s ease-out;
}

.ul-btn p::before {
  position: absolute;
  content: attr(data-text);
  width: 0%;
  inset: 0;
  color: var(--hovered-color);
  overflow: hidden;
  transition: 0.3s ease-out;
  white-space: nowrap;
}

.ul-btn:hover::after, .ul-btn:focus-visible::after {
  width: 100%;
}

.ul-btn:hover p::before, .ul-btn:focus-visible p::before {
  width: 100%;
}

.ul-btn:focus-visible {
  outline: none;
}
`;

export default function UnderlineButton({
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
  const text = React.Children.toArray(children)
    .filter((child): child is string | number => typeof child === "string" || typeof child === "number")
    .join("");
  const content = (
    <p data-text={text}>{children}</p>
  );

  if (href) {
    if (href.startsWith("#")) {
      return (
        <a href={href} onClick={onClick} className={`ul-btn hover-trigger ${className}`}>
          <style>{styles}</style>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={`ul-btn hover-trigger ${className}`} onClick={onClick}>
        <style>{styles}</style>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`ul-btn hover-trigger ${className}`}>
      <style>{styles}</style>
      {content}
    </button>
  );
}
