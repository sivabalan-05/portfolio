"use client";

import Link from "next/link";
import LangToggle from "./LangToggle";
import ScrambleText from "./ScrambleText";
import UnderlineButton from "./UnderlineButton";
import { useT } from "@/i18n/LanguageContext";
import { usePathname } from "next/navigation";

const styles = `
  .sh {
    position: fixed; top: clamp(1.4rem, 3.2vh, 2.4rem); z-index: 1000;
    font-family: var(--font-body), sans-serif;
    font-size: var(--type-micro); text-transform: lowercase; letter-spacing: .1em;
    color: var(--site-ink, #1C1B18);
    pointer-events: auto;
  }
  .sh--l { left: clamp(1.5rem, 5vw, 5.5rem); display: flex; flex-direction: column; gap: .12rem; line-height: 1.1; }
  .sh__mark {
    font-family: var(--font-pixelscript, cursive);
    font-weight: 400; font-size: 2.3rem; letter-spacing: 0;
    line-height: 1; text-transform: none;
    font-kerning: normal;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
    text-rendering: optimizeLegibility;
    color: inherit; text-decoration: none;
  }
  .sh__mark .text-star {
    display: inline-block;
    transform-origin: 50% 52%;
    transition: color .25s ease;
  }
  .sh__name {
    position: relative;
    white-space: nowrap;
  }
  .sh__name-word { display: inline; }
  .sh__name::after {
    content: "✦  ·  ♡  ⋆";
    position: absolute;
    left: 52%;
    top: -.42rem;
    font-family: var(--font-mono), monospace;
    font-size: .42em;
    font-weight: 400;
    letter-spacing: .08em;
    color: var(--green, #14736e);
    opacity: 0;
    transform: translate(-50%, .35rem) scale(.82);
    pointer-events: none;
  }
  .sh__mark:hover .text-star,
  .sh__mark:focus-visible .text-star {
    color: var(--green, #14736e);
    animation: sh-star-dance .72s cubic-bezier(.16, 1, .3, 1) both;
  }
  .sh__mark:hover .sh__name::after,
  .sh__mark:focus-visible .sh__name::after {
    animation: sh-symbols-float .78s cubic-bezier(.16, 1, .3, 1) both;
  }
  .sh__mark:focus-visible { outline: 2px dotted var(--site-ink, #1C1B18); outline-offset: 4px; }
  .sh--r { right: clamp(1.5rem, 5vw, 5.5rem); display: flex; align-items: center; gap: 1rem; }
  .sh__status {
    display: inline-flex; align-items: center; gap: .42rem;
    font-size: var(--type-micro); letter-spacing: .06em; opacity: .82; white-space: nowrap;
  }
  .sh__dot {
    position: relative;
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--selection-bg, #843f3a);
  }
  .sh__dot::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: currentColor;
    opacity: .35;
    animation: sh-pulse 2.4s ease-out infinite;
    will-change: transform, opacity;
  }
  @keyframes sh-pulse {
    0% { transform: scale(1); opacity: .35; }
    70%, 100% { transform: scale(2.7); opacity: 0; }
  }
  @keyframes sh-star-dance {
    0% { transform: rotate(0deg) scale(1); }
    42% { transform: rotate(110deg) scale(1.28); }
    72% { transform: rotate(78deg) scale(.94); }
    100% { transform: rotate(90deg) scale(1); }
  }
  @keyframes sh-symbols-float {
    0% { opacity: 0; transform: translate(-50%, .35rem) scale(.82); }
    34% { opacity: .9; }
    72% { opacity: .68; }
    100% { opacity: 0; transform: translate(-50%, -.8rem) scale(1.08); }
  }
  .sh__nav { display: inline-flex; align-items: center; gap: .7rem; }
  .sh__nav a { font-size: var(--type-micro); letter-spacing: .04em; }
  @media (prefers-reduced-motion: reduce) {
    .sh__dot::after,
    .sh__mark .text-star,
    .sh__name::after { animation: none; }
  }
  @media (max-width: 860px) {
    .sh__status, .sh__nav { display: none; }
    .sh--l { max-width: calc(100vw - 8rem); }
    .sh__mark { font-size: clamp(1.15rem, 5.6vw, 1.55rem); line-height: .98; }
    /* Em tela estreita o conteúdo passa por baixo do cabeçalho fixo e a
       assinatura ficava ilegível sobre o texto. O halo de papel é o mesmo
       idioma já usado em .pj-tag e .lang-toggle — resolve a leitura sem
       fechar o topo da página com uma barra sólida. */
    .sh__mark {
      padding: .2rem .45rem;
      background: color-mix(in srgb, var(--site-paper, #ede7da) 88%, transparent);
      box-shadow: 0 0 0 .3rem color-mix(in srgb, var(--site-paper, #ede7da) 88%, transparent);
      -webkit-backdrop-filter: blur(5px);
      backdrop-filter: blur(5px);
    }
  }
`;

export default function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";

  return (
    <>
      <style>{styles}</style>
      <span className="sh sh--l">
        <Link href="/" className="sh__mark" aria-label="Sivabalan">
          <span className="text-star" aria-hidden="true">✳︎</span>{" "}
          <span className="sh__name">
            <span className="sh__name-word">Sivabalan</span>
          </span>
        </Link>
      </span>
      <span className="sh sh--r">
        <span className="sh__status">
          <span className="sh__dot" aria-hidden="true" />
          <ScrambleText text="available for work" />
        </span>
        <nav className="sh__nav" aria-label="navigation">
          <UnderlineButton href={isHome ? "#work" : "/#work"}>
            projects
          </UnderlineButton>
          <UnderlineButton href="/#about">
            about
          </UnderlineButton>
          <UnderlineButton href="/#skills">
            skills
          </UnderlineButton>
          <UnderlineButton href="/#experience">
            experience
          </UnderlineButton>
          <UnderlineButton href="/#contact">
            contact
          </UnderlineButton>
        </nav>
      </span>
    </>
  );
}
