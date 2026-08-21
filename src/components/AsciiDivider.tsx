"use client";

/**
 * Divisores ASCII no lugar das linhas CSS tracejadas. O padrão estrutural é
 * `------`; ornamentos podem fornecer outros padrões. É texto puro repetido e cortado
 * na largura do container ou da tela inteira (fullWidth) — leve, sem imagem, sem JS.
 *
 * `braille`: usa a BrailleMono (já carregada pros ornamentos) — glifos ⠂⠄⠁
 * renderizam garantido. Os outros padrões (︶ ꒷ ꒦ ◠ ⊹ ˚ ₊) vêm de blocos
 * unicode bem cobertos por Segoe/Noto.
 *
 * `fullWidth`: faz o divisor sangrar de ponta a ponta na tela (100vw),
 * ignorando paddings de containers pai.
 *
 * `repeat={false}`: peça única centralizada (ex.: a carinha ૮₍ ´ ꒳ ` ₎a)
 * em vez de padrão repetido de ponta a ponta.
 */
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
