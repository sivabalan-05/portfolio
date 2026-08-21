"use client";
import { useT } from "@/i18n/LanguageContext";

export default function LangToggle() {
  const { lang, toggleLang } = useT();

  return (
    <button
      onClick={toggleLang}
      aria-label={lang === "pt" ? "Switch to English" : "Mudar para Português"}
      className="lang-toggle hover-trigger"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "var(--type-micro)",
        letterSpacing: "1px",
        textTransform: "uppercase",
        minWidth: "var(--tap-min)",
        minHeight: "var(--tap-min)",
        display: "inline-grid",
        placeItems: "center",
        padding: ".55rem .75rem",
        border: "1px solid currentColor",
        borderRadius: "var(--r-pill, 99px)",
        background: "color-mix(in srgb, var(--paper) 90%, transparent)",
        boxShadow: "2px 2px 0 color-mix(in srgb, currentColor 14%, transparent)",
        color: "inherit",
        cursor: "pointer",
        transition: "opacity 0.2s, transform 0.2s, box-shadow 0.2s",
      }}
    >
      {lang === "pt" ? "EN" : "PT"}
    </button>
  );
}
