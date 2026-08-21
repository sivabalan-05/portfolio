"use client";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { useT } from "@/i18n/LanguageContext";

/**
 * 404 = página arrancada do caderno (ideia aprovada por ela, 2026-07-23).
 * Uma folha com a borda rasgada, restos de ASCII caídos e um bilhete
 * manuscrito. AUTOCONTIDA de propósito: criada enquanto o Codex trabalha
 * no tree — não importa nenhum componente que ele esteja editando.
 */

/* borda rasgada: polígono irregular só no topo da folha */
const RASGO =
  "polygon(0 22px, 3% 8px, 7% 18px, 11% 4px, 16% 16px, 21% 6px, 26% 20px, 31% 9px, 36% 17px, 42% 3px, 47% 15px, 52% 7px, 57% 19px, 63% 5px, 68% 14px, 73% 8px, 78% 18px, 84% 6px, 89% 16px, 94% 9px, 100% 20px, 100% 100%, 0 100%)";

const styles = `
  .nf {
    min-height: 100svh;
    background: var(--site-paper, #EDE7DA);
    color: var(--site-ink, #1C1B18);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 1.5rem;
    overflow: hidden;
    position: relative;
  }
  .nf__resto {
    position: absolute;
    font-family: var(--font-braille), monospace;
    color: var(--site-ink);
    opacity: .18;
    user-select: none;
    pointer-events: none;
    white-space: pre;
    line-height: 1;
  }
  .nf__folha {
    position: relative;
    width: min(560px, 92vw);
    background: #F6F1E6;
    clip-path: ${RASGO};
    padding: 4rem 2.5rem 3rem;
    text-align: center;
    box-shadow: 0 18px 30px rgba(0,0,0,.12);
  }
  .nf__num {
    font-family: var(--font-subtitle), monospace;
    font-weight: 700;
    font-size: clamp(4.5rem, 16vw, 8rem);
    line-height: .9;
    letter-spacing: .02em;
    margin: 0 0 1rem;
    opacity: .9;
  }
  .nf__nota {
    font-family: var(--font-hand), var(--font-pixelscript), cursive;
    font-size: clamp(1.2rem, 3vw, 1.7rem);
    line-height: 1.35;
    margin: 0 0 .8rem;
  }
  .nf__sub {
    font-family: var(--font-body), sans-serif;
    font-size: .85rem;
    line-height: 1.6;
    opacity: .65;
    margin: 0 0 2.2rem;
  }
  .nf__voltar {
    display: inline-block;
    font-family: var(--font-subtitle), monospace;
    font-weight: 700;
    font-size: .8rem;
    text-transform: lowercase;
    letter-spacing: .04em;
    background: var(--site-ink);
    color: var(--site-paper);
    padding: .55rem 1.1rem;
    text-decoration: none;
    transition: opacity .2s ease, transform .2s ease;
  }
  .nf__voltar:hover { opacity: .85; transform: translateY(-2px); }
  .nf__voltar:focus-visible { outline: 2px dotted var(--site-ink); outline-offset: 4px; }
  .nf__fio {
    margin-top: 2.4rem;
    font-family: var(--font-mono), monospace;
    font-size: .7rem;
    letter-spacing: .1em;
    opacity: .45;
    user-select: none;
  }
`;

export default function NotFound() {
  const { lang } = useT();
  const pt = lang !== "en";

  return (
    <main className="nf">
      <style>{styles}</style>
      <SiteHeader />

      {/* restos de caracteres que "caíram" da folha rasgada */}
      <span className="nf__resto" style={{ top: "12%", left: "14%", fontSize: 14, transform: "rotate(-14deg)" }}>⠋⠉⠁</span>
      <span className="nf__resto" style={{ top: "26%", right: "12%", fontSize: 11, transform: "rotate(9deg)" }}>⠴⠆</span>
      <span className="nf__resto" style={{ bottom: "18%", left: "20%", fontSize: 12, transform: "rotate(22deg)" }}>⠐⠕⠂</span>
      <span className="nf__resto" style={{ bottom: "10%", right: "22%", fontSize: 15, transform: "rotate(-7deg)" }}>⠈⠷</span>
      <span className="nf__resto" style={{ top: "58%", left: "7%", fontSize: 10, transform: "rotate(4deg)" }}>⠉⠛⠉</span>

      <div className="nf__folha">
        <p className="nf__num" aria-hidden="true">404</p>
        <p className="nf__nota">
          {pt ? "essa página foi arrancada do caderno" : "this page was torn out of the notebook"}
        </p>
        <p className="nf__sub">
          {pt
            ? "talvez ela tenha virado rascunho, talvez nunca tenha existido."
            : "maybe it became a draft, maybe it never existed at all."}
        </p>
        <Link href="/" className="nf__voltar">
          [ {pt ? "voltar pro início" : "back to start"} ]
        </Link>
        <p className="nf__fio" aria-hidden="true">.・。.・゜✭・.・✫・゜・。.</p>
      </div>
    </main>
  );
}
