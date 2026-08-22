"use client";
import { useEffect, useRef, useState } from "react";
import ScrambleText from "./ScrambleText";
import { useT } from "@/i18n/LanguageContext";
import { StampCanvas, useCreativeStudio } from "./CreativeStudio";

/* 8px stepped pixel clip-path for retro-editorial frames */
export const PIXEL_CLIP =
  "polygon(0 8px, 8px 8px, 8px 0, calc(100% - 8px) 0, calc(100% - 8px) 8px, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 8px calc(100% - 8px), 0 calc(100% - 8px))";

type ClockPeriod = "late" | "morning" | "afternoon" | "evening";

const CLOCK_GREETINGS: Record<
  "pt" | "en",
  Record<ClockPeriod, readonly string[]>
> = {
  pt: {
    late: [
      "a luz dormiu acesa",
      "o computador ainda quente",
      "só o brilho da tela agora",
      "o silêncio ficou mais alto",
      "só o som do ventilador do pc",
    ],
    morning: ["bom dia?"],
    afternoon: [
      "horário comercial, aparentemente",
      "produtividade, dizem",
      "tecnicamente ainda é dia útil",
      "meio do expediente, moralmente falando",
    ],
    evening: ["a luz dormiu acesa"],
  },
  en: {
    late: [
      "the light fell asleep first",
      "computer's still warm",
      "just the screen glow now",
      "the silence got louder",
      "just the pc fan humming",
    ],
    morning: ["morning, i guess?"],
    afternoon: [
      "College hours, apparently",
      "productivity, allegedly",
      "technically still a workday",
      "mid-shift, morally speaking",
    ],
    evening: ["the light stayed on"],
  },
};

function clockPeriodFor(hour: number): ClockPeriod {
  if (hour < 6) return "late";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

/** Live clock & contextual greeting component */
function LiveClock() {
  const { lang } = useT();
  const [now, setNow] = useState("");
  const [greet, setGreet] = useState("");
  const phraseRef = useRef<{ period: ClockPeriod | ""; index: number }>({
    period: "",
    index: 0,
  });

  useEffect(() => {
    const phraseFor = (hour: number) => {
      const period = clockPeriodFor(hour);

      if (phraseRef.current.period !== period) {
        const phrases = CLOCK_GREETINGS.pt[period];
        const indexKey = `portfolio-clock-${period}`;
        const loadKey = `portfolio-clock-load-${period}`;
        const pageLoad = String(performance.timeOrigin);
        const savedIndex = Number.parseInt(
          sessionStorage.getItem(indexKey) ?? "-1",
          10,
        );
        const currentIndex =
          Number.isFinite(savedIndex) && savedIndex >= 0 ? savedIndex : 0;
        const samePageLoad = sessionStorage.getItem(loadKey) === pageLoad;
        const nextIndex = samePageLoad
          ? currentIndex % phrases.length
          : savedIndex < 0
            ? 0
            : (currentIndex + 1) % phrases.length;

        sessionStorage.setItem(indexKey, String(nextIndex));
        sessionStorage.setItem(loadKey, pageLoad);
        phraseRef.current = { period, index: nextIndex };
      }

      const { period: activePeriod, index } = phraseRef.current;
      if (!activePeriod) return "";
      const phrases = CLOCK_GREETINGS[lang][activePeriod];
      return phrases[index % phrases.length];
    };

    const tick = () => {
      const d = new Date();
      setNow(
        d
          .toLocaleString(lang === "pt" ? "pt-BR" : "en-US", {
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
          .replace(",", "")
      );
      setGreet(phraseFor(d.getHours()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lang]);
  return (
    <span className="ph__clock" suppressHydrationWarning>
      <span className="ph__greet">{greet || "…"}</span>
      <span className="ph__note" style={{ color: "var(--acid)" }}>
        {now || "…"}
      </span>
    </span>
  );
}

const styles = `
  .ph {
    position: relative;
    background: transparent; /* Transparent background to allow grain & gradient blend */
    color: var(--ink);
    /* Exact 100svh viewport framing */
    height: 100svh;
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 8.5rem 5.5rem 2.5rem;
    overflow: hidden;
  }
  .ph__meta {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-family: var(--font-body);
    font-size: var(--type-micro);
    text-transform: lowercase;
    letter-spacing: .12em;
    padding-bottom: .55rem;
    position: relative;
    z-index: 1;
  }
  .ph__title {
    /* PF Pixelscript hero headline with responsive scaling */
    font-family: var(--font-pixelscript);
    font-weight: 400;
    font-size: clamp(2rem, min(7.5vw, 9.5vh), 6.5rem);
    line-height: .98;
    /* tracking levemente negativo — testado que a Pixelscript aguenta -.015em
       sem quebrar as ligações do script (mais que isso começa a colar demais) */
    letter-spacing: -.015em;
    text-transform: none;
    margin: 0;
    position: absolute;
    left: clamp(5.5rem, 5.1vw, 6.25rem);
    right: 5.5rem;
    top: 52.5%;
    pointer-events: none;
  }
  /* padding+margin negativa: expande a CAIXA DE CLIP (máscara da entrada) sem
     mudar o ritmo. A Pixelscript tem capitulares altas e descendentes longas,
     então o respiro inferior precisa ser maior que o line box convencional. */
  .ph__line {
    position: relative;
    overflow: hidden;
    display: block;
    padding: .24em .2em .64em .2em;
    margin: -.24em -.2em -.64em -.2em;
  }
  .ph__line:first-child {
    z-index: 1; /* under image */
  }
  .ph__line:nth-child(n+2) {
    z-index: 20; /* over image */
  }
  .ph__line-inner {
    display: block;
    will-change: transform, filter;
    animation: ph-title-arrive .9s cubic-bezier(.16, 1, .3, 1) var(--line-delay, .15s) both;
  }
  .ph__line:nth-child(2) .ph__line-inner { --line-delay: .26s; }
  @keyframes ph-title-arrive {
    from { transform: translate3d(0, .3em, 0); filter: blur(.35px); }
    to { transform: translate3d(0, 0, 0); filter: blur(0); }
  }
  /* Em telas pequenas o mesmo gesto precisa resolver antes: mantém a entrada
     preferida, mas evita que o LCP espere quase um segundo pela animação. */
  @media (max-width: 767px) {
    .ph__line-inner {
      animation-duration: .48s;
      --line-delay: .02s;
    }
    .ph__line:nth-child(2) .ph__line-inner { --line-delay: .08s; }
  }
  .ph__line--acid { color: var(--hero-highlight, var(--acid)); }
  .ph__sub {
    font-family: var(--font-body);
    font-size: clamp(.95rem, 1.3vw, 1.1rem);
    line-height: 1.5;
  }
  /* Subtitle positioned with clean left alignment */
  .ph__sub--pocket {
    position: absolute;
    left: 45.6%;
    top: 79%;
    /* Fixed editorial subtitle width prevents layout reflow */
    width: max-content;
    max-width: 50vw;
    max-width: none;
    text-align: left;
    text-transform: lowercase;
    font-family: var(--font-subtitle);
    font-size: clamp(.78rem, 1.2vw, 1.3rem);
    line-height: 1.35;
    letter-spacing: .01em;
    z-index: 20;
    pointer-events: none;
  }
  .ph__sub-line {
    display: block;
    white-space: nowrap;
  }
  .ph__title[data-compact="true"] {
    font-size: clamp(1.9rem, min(6.3vw, 8vh), 5.5rem);
    line-height: 1.02;
  }
  /* Em notebooks, preserva a mesma composição por proporção. */
  @media (min-width: 721px) and (max-width: 1359px) {
    .ph__title { top: 52.5%; }
    .ph__sub--pocket {
      left: 45.6%;
      top: 79%;
      max-width: 52vw;
    }
  }
  .ph__scroll {
    font-family: var(--font-hand);
    font-size: 1.35rem;
    letter-spacing: .01em;
  }
  .ph__em { font-family: var(--font-head); font-style: italic; font-weight: 800; letter-spacing: -0.01em; }
  .ph__wave-word { display: inline-block; white-space: nowrap; }
  .ph__wave-char { display: inline-block; }
  @keyframes ph-wave {
    0%, 7%, 100% { transform: translateY(0); }
    3.5% { transform: translateY(-3px); }
  }
  @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
    .ph__wave-char {
      animation: ph-wave 8.52s cubic-bezier(.33, 1, .68, 1) var(--wave-delay) infinite;
    }
  }

  /* --- adesivos arrastáveis --- */
  .ph__sticker {
    position: absolute;
    z-index: 2;
    cursor: grab;
    touch-action: none;
    user-select: none;
    transform: rotate(var(--sticker-rotate, 0deg));
    animation: ph-sticker-in .5s cubic-bezier(.16, 1, .3, 1) var(--sticker-delay, .9s) both;
  }
  @keyframes ph-sticker-in {
    from { opacity: 0; transform: scale(.6) rotate(var(--sticker-rotate, 0deg)); }
    to { opacity: 1; transform: scale(1) rotate(var(--sticker-rotate, 0deg)); }
  }
  .ph__sticker:active { cursor: grabbing; }
  .ph__note {
    font-family: var(--font-subtitle);
    font-size: var(--type-micro);
    text-transform: lowercase;
    letter-spacing: .08em;
    white-space: nowrap;
    pointer-events: none;
    opacity: .62;
  }
  .ph__clock { display: inline-flex; flex-direction: column; gap: .15rem; }
  .ph__greet {
    /* OffBit monospace font styling */
    font-family: var(--font-subtitle);
    font-size: 1.2rem;
    text-transform: lowercase;
    font-weight: 400;
    line-height: 1;
    letter-spacing: .02em;
    color: var(--ink);
    white-space: nowrap;
    pointer-events: none;
  }
  @media (max-width: 768px) {
    .ph {
      height: auto;
      min-height: 100svh;
      padding: 5.5rem 1.25rem 2.5rem;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }
    .ph__meta span:nth-child(2) { display: none; }
    .ph__title {
      position: relative;
      left: auto;
      right: auto;
      top: auto;
      font-family: var(--font-pixelscript);
      font-weight: 400;
      font-size: clamp(1.85rem, 8.8vw, 2.75rem);
      line-height: 1.12;
      letter-spacing: -.015em;
      margin: 0.75rem 0 0.5rem;
      translate: none;
      text-align: left;
    }
    .ph__title[data-compact="true"] {
      font-size: clamp(1.65rem, 8vw, 2.35rem);
      line-height: 1.12;
    }
    .ph__sub--pocket {
      position: relative;
      left: auto;
      top: auto;
      width: 100%;
      max-width: 100%;
      margin-top: 0.5rem;
      translate: none;
      font-size: clamp(.85rem, 3.8vw, 1.05rem);
      line-height: 1.45;
    }
    .ph__sub-line { white-space: normal; }
    .ph__sticker--desk { display: none; }
    .ph__sticker { cursor: default; }
    .ph__sticker--clock {
      position: relative;
      left: auto !important;
      right: auto !important;
      top: auto !important;
      margin-bottom: 0.25rem;
      text-align: left;
    }
    .ph__greet { font-size: 1.1rem; }
    .ph__note { font-size: var(--type-micro); }
  }
  @media (prefers-reduced-motion: reduce) {
    .ph__line > span { transform: none !important; animation: none !important; filter: none !important; }
    .ph__sticker { translate: none; }
  }
`;

type Sticker = {
  key: string;
  left: string;
  top: string;
  rotate: number;
  deskOnly?: boolean;
  el: React.ReactNode;
};

function DraggableSticker({
  sticker,
  index,
  bounds,
  canDrag,
  resetToken,
  onMoved,
  onSound,
}: {
  sticker: Sticker;
  index: number;
  bounds: React.RefObject<HTMLElement | null>;
  canDrag: boolean;
  resetToken: number;
  onMoved: () => void;
  onSound: () => void;
}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const previousReset = useRef(resetToken);

  useEffect(() => {
    if (previousReset.current === resetToken) return;
    previousReset.current = resetToken;
    offsetRef.current = { x: 0, y: 0 };
    if (elementRef.current) {
      elementRef.current.style.transform = `translate3d(0, 0, 0) rotate(${sticker.rotate}deg)`;
    }
  }, [resetToken, sticker.rotate]);

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !elementRef.current) return;
    const nextX = offsetRef.current.x + event.clientX - drag.x;
    const nextY = offsetRef.current.y + event.clientY - drag.y;
    elementRef.current.style.transform =
      `translate3d(${nextX}px, ${nextY}px, 0) rotate(0deg) scale(1.06)`;
  };

  const finish = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !elementRef.current) return;
    offsetRef.current = {
      x: offsetRef.current.x + event.clientX - drag.x,
      y: offsetRef.current.y + event.clientY - drag.y,
    };
    dragRef.current = null;
    elementRef.current.releasePointerCapture(event.pointerId);
    elementRef.current.style.transform =
      `translate3d(${offsetRef.current.x}px, ${offsetRef.current.y}px, 0) rotate(${sticker.rotate}deg)`;
    onMoved();
    onSound();
  };

  return (
    <div
      ref={elementRef}
      className={`ph__sticker ph__sticker--${sticker.key}${sticker.deskOnly ? " ph__sticker--desk" : ""}`}
      data-no-stamp
      style={{
        left: sticker.left,
        top: sticker.top,
        "--sticker-rotate": `${sticker.rotate}deg`,
        "--sticker-delay": `${0.9 + index * 0.07}s`,
      } as React.CSSProperties}
      onPointerDown={(event) => {
        if (!canDrag || !bounds.current) return;
        dragRef.current = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
        onSound();
      }}
      onPointerMove={move}
      onPointerUp={finish}
      onPointerCancel={finish}
    >
      {sticker.el}
    </div>
  );
}

export default function PlaygroundHero({
  lines,
  sub,
  subHighlight,
  scrollLabel,
  children,
}: {
  lines: string[];
  sub: string;
  subHighlight: string;
  scrollLabel: string;
  children?: React.ReactNode;
}) {
  const bounds = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const {
    stampMode,
    resetToken,
    markMoved,
    playSound,
  } = useCreativeStudio();

  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");
    const syncViewport = () => setIsMobile(media.matches);

    syncViewport();
    media.addEventListener("change", syncViewport);
    return () => media.removeEventListener("change", syncViewport);
  }, []);

  const canDrag = !isMobile;

  // Functional hero elements with ASCII backdrop integration
  const stickers: Sticker[] = [
    // Nested dynamically within the canvas negative space
    // Balances typography within the artwork whitespace
    { key: "clock", left: "58%", top: "12%", rotate: 3, el: <LiveClock /> },
  ];

  return (
    <section className="ph" ref={bounds} data-stamp-active={stampMode ? "true" : "false"}>
      <style>{styles}</style>
      <StampCanvas />
      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {scrollLabel}
      </span>

      {/* Interactive draggable stamps and badges */}
      {stickers.map((s, i) => (
        <DraggableSticker
          key={s.key}
          sticker={s}
          index={i}
          bounds={bounds}
          canDrag={canDrag}
          resetToken={resetToken}
          onMoved={markMoved}
          onSound={() => playSound("drag")}
        />
      ))}

      {/* Scatter navigation tags */}
      {children}


      <h1
        className="ph__title"
        data-compact={lines.join(" ").length > 48 ? "true" : "false"}
        suppressHydrationWarning
      >
        {lines.map((l, i) => (
          <span className="ph__line" key={i}>
            <span
              className={`ph__line-inner${i === lines.length - 1 ? " ph__line--acid" : ""}`}
              style={{ display: "block" }}
            >
              <ScrambleText text={l} />
            </span>
          </span>
        ))}
      </h1>
      {/* frase no espaço em branco da onda (concavidade), alinhada à ESQUERDA
          e em OffBit — abaixo do título pra não encostar nele */}
      <p
        className="ph__sub ph__sub--pocket"
      >
        <span>
          <span className="ph__sub-line">{sub}</span>
          <span className="ph__em">{subHighlight}</span>
        </span>
      </p>
    </section>
  );
}
