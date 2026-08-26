"use client";

import React from "react";

export const DIVIDERS = {
  line: "------  ",
  star: "✦ .  ⁺  . ✦ .  ⁺  . ✦ .  ⁺  . ✦",
  bow: "⋆ ˚｡⋆୨♡୧⋆ ˚｡⋆",
  heart: "˗ˏˋ ꒰ ♡ ꒱ ˎˊ˗",
} as const;

export default function AsciiDivider({
  pattern = DIVIDERS.line,
  repeat = true,
  braille = false,
  fullWidth = false,
  opacity = 0.5,
  size = "var(--type-ascii-rule, .85rem)",
  className,
  style,
}: {
  pattern?: string;
  repeat?: boolean;
  braille?: boolean;
  fullWidth?: boolean;
  opacity?: number;
  size?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const isFullBleed = repeat && fullWidth;

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        minWidth: 0,
        width: isFullBleed ? "100vw" : "100%",
        position: isFullBleed ? "relative" : "static",
        left: isFullBleed ? "50%" : undefined,
        right: isFullBleed ? "50%" : undefined,
        marginLeft: isFullBleed ? "-50vw" : undefined,
        marginRight: isFullBleed ? "-50vw" : undefined,
        textAlign: "center",
        lineHeight: 1,
        fontFamily: braille ? "var(--font-braille), monospace" : "var(--font-mono), monospace",
        fontSize: size,
        opacity,
        color: "currentColor",
        userSelect: "none",
        pointerEvents: "none",
        ...style,
      }}
    >
      {repeat ? pattern.repeat(Math.max(1, Math.ceil(800 / pattern.length))) : pattern}
    </div>
  );
}
