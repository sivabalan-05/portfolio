"use client";

/**
 * Janelinha estilo Mac (ideia dela, da referência Barbiana) para exibir
 * conteúdos de social media: barra com as três bolinhas + nome de arquivo
 * em mono, corpo escuro, canto pixelado da nossa identidade.
 */
import { PIXEL_CLIP } from "./PlaygroundHero";

export default function MacWindow({
  filename,
  rotate = 0,
  children,
  style,
}: {
  filename: string;
  rotate?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "#161616",
        border: "1px solid rgba(242,241,236,.22)",
        clipPath: PIXEL_CLIP,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 10px",
          borderBottom: "1px solid rgba(242,241,236,.15)",
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
        <span
          style={{
            marginLeft: 8,
            fontFamily: "var(--font-mono)",
            fontSize: ".62rem",
            letterSpacing: ".08em",
            textTransform: "lowercase",
            color: "rgba(242,241,236,.65)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {filename}
        </span>
      </div>
      <div style={{ background: "#000" }}>{children}</div>
    </div>
  );
}
