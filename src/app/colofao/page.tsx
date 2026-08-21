"use client";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

const styles = `
  .cf {
    min-height: 100svh;
    background: var(--site-paper, #EDE7DA);
    color: var(--site-ink, #1C1B18);
    padding: 7rem 1.5rem 5rem;
  }
  .cf__miolo { max-width: 640px; margin: 0 auto; }
  .cf__voltar {
    font-family: var(--font-body), sans-serif;
    font-size: .72rem;
    letter-spacing: .1em;
    text-transform: lowercase;
    color: var(--site-ink);
    text-decoration: none;
    opacity: .6;
  }
  .cf__voltar:hover { opacity: 1; text-decoration: underline; text-underline-offset: 3px; }
  .cf__voltar:focus-visible { outline: 2px dotted var(--site-ink); outline-offset: 4px; }
  .cf__titulo {
    font-family: var(--font-pixelscript), var(--font-hand), cursive;
    font-weight: 400;
    font-size: clamp(2.6rem, 8vw, 4.2rem);
    line-height: 1.05;
    margin: 1.6rem 0 .6rem;
  }
  .cf__abre {
    font-family: var(--font-head), serif;
    font-style: italic;
    font-size: 1.05rem;
    line-height: 1.55;
    opacity: .8;
    margin: 0 0 3rem;
    max-width: 46ch;
  }
  .cf__fio {
    font-family: var(--font-braille), monospace;
    font-size: .64rem;
    letter-spacing: 0;
    opacity: .5;
    overflow: hidden;
    white-space: nowrap;
    margin: 2.6rem 0 1.2rem;
    user-select: none;
  }
  .cf__rotulo {
    font-family: var(--font-body), sans-serif;
    font-size: .72rem;
    text-transform: lowercase;
    letter-spacing: .14em;
    opacity: .55;
    margin: 0 0 1.2rem;
  }
  .cf__linha {
    display: grid;
    grid-template-columns: minmax(7rem, .4fr) 1fr;
    gap: 1.2rem;
    align-items: baseline;
    padding: .7rem 0;
  }
  .cf__meta {
    font-family: var(--font-body), sans-serif;
    font-size: .72rem;
    letter-spacing: .08em;
    text-transform: lowercase;
    opacity: .55;
  }
  .cf__valor {
    font-family: var(--font-body), sans-serif;
    font-size: .92rem;
    line-height: 1.55;
  }
  .cf__esp { font-size: 1.25rem; line-height: 1.3; }
  .cf__esp--pixelscript { font-family: var(--font-pixelscript), cursive; font-size: 1.5rem; }
  .cf__esp--serif { font-family: var(--font-head), serif; font-style: italic; }
  .cf__esp--body { font-family: var(--font-body), sans-serif; }
  .cf__esp--pixel { font-family: var(--font-subtitle), monospace; font-weight: 700; font-size: 1.05rem; }
  .cf__esp--hand { font-family: var(--font-hand), cursive; font-size: 1.45rem; }
  .cf__esp--braille { font-family: var(--font-braille), monospace; font-size: 1rem; letter-spacing: 0; }
  .cf__fecho {
    margin-top: 3.4rem;
    text-align: center;
    font-family: var(--font-hand), cursive;
    font-size: 1.25rem;
    opacity: .8;
  }
  .cf__estrelas {
    text-align: center;
    font-family: var(--font-mono), monospace;
    font-size: .72rem;
    letter-spacing: .08em;
    opacity: .45;
    margin-top: .8rem;
    user-select: none;
  }
  @media (max-width: 560px) {
    .cf { padding: 5rem 1.25rem 4rem; }
    .cf__linha { grid-template-columns: 1fr; gap: .25rem; }
  }
`;

const FIO = "⠂⠄⠄⠂⠁⠁⠂ ".repeat(40);

export default function Colofao() {
  const edition: [string, string][] = [
    ["edition", "1st Edition — Portfolio 2026"],
    ["author", "Sivabalan D"],
    ["print run", "Unlimited digital distribution"],
    ["palette", "Warm Beige #EDE7DA · Ink #1C1B18"],
  ];

  const types: { meta: string; classe: string; amostra: string }[] = [
    { meta: "display", classe: "cf__esp cf__esp--pixelscript", amostra: "PF Pixelscript" },
    { meta: "editorial", classe: "cf__esp cf__esp--serif", amostra: "Instrument Serif" },
    { meta: "body", classe: "cf__esp cf__esp--body", amostra: "Aeonik" },
    { meta: "numbers & labels", classe: "cf__esp cf__esp--pixel", amostra: "OffBit DotBold" },
    { meta: "handwriting", classe: "cf__esp cf__esp--hand", amostra: "Seratonin" },
    { meta: "engravings", classe: "cf__esp cf__esp--braille", amostra: "⠎⠑⠗⠁⠋⠊⠝⠁ ⠃⠗⠁⠊⠇⠇⠑" },
  ];

  const techniques: [string, string][] = [
    ["framework", "Next.js 15 · React 19 · TypeScript"],
    ["interaction", "Framer Motion · Lenis Smooth Scroll"],
    ["styling", "Modular Design Tokens · Vanilla CSS"],
    ["craft", "Canvas Shaders, Unicode & ASCII Engravings"],
  ];

  return (
    <main className="cf">
      <style>{styles}</style>
      <SiteHeader />
      <div className="cf__miolo">
        <Link href="/" className="cf__voltar">← back to home</Link>

        <h1 className="cf__titulo">Colophon</h1>
        <p className="cf__abre">
          A dedicated note on the craft, typography, engineering principles, and creative technology behind this digital edition.
        </p>

        <div className="cf__fio" aria-hidden="true">{FIO}</div>
        <p className="cf__rotulo">the edition</p>
        {edition.map(([m, v]) => (
          <div className="cf__linha" key={m}>
            <span className="cf__meta">{m}</span>
            <span className="cf__valor">{v}</span>
          </div>
        ))}

        <div className="cf__fio" aria-hidden="true">{FIO}</div>
        <p className="cf__rotulo">the typographic voices</p>
        {types.map((tipo) => (
          <div className="cf__linha" key={tipo.meta}>
            <span className="cf__meta">{tipo.meta}</span>
            <span className={tipo.classe}>{tipo.amostra}</span>
          </div>
        ))}

        <div className="cf__fio" aria-hidden="true">{FIO}</div>
        <p className="cf__rotulo">the technology & techniques</p>
        {techniques.map(([m, v]) => (
          <div className="cf__linha" key={m}>
            <span className="cf__meta">{m}</span>
            <span className="cf__valor">{v}</span>
          </div>
        ))}

        <p className="cf__fecho">
          engineered with care, coffee and ASCII by Sivabalan.
        </p>
        <p className="cf__estrelas" aria-hidden="true">.・。.・゜✭・.・✫・゜・。.</p>
      </div>
    </main>
  );
}
