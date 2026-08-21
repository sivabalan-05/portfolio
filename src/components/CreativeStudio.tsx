"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type PaperMode = "cream" | "cyanotype" | "vellum";
export type StudioSound = "stamp" | "paper" | "drag" | "hover" | "flip";

type Stamp = {
  id: number;
  symbol: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  opacity: number;
};

type StudioContextValue = {
  studioActive: boolean;
  paper: PaperMode;
  stampMode: boolean;
  stamps: Stamp[];
  nextStamp: string;
  soundEnabled: boolean;
  moved: boolean;
  resetToken: number;
  cyclePaper: () => void;
  toggleStampMode: () => void;
  addStamp: (x: number, y: number) => void;
  clearStamps: () => void;
  toggleSound: () => void;
  markMoved: () => void;
  resetTable: () => void;
  playSound: (kind: StudioSound) => void;
};

const STAMPS = [
  "⸜(｡˃ ᵕ ˂ )⸝♡",
  "≽^•⩊•^≼",
  "૮₍ ˶ᵔ ᵕ ᵔ˶ ₎ა",
  "(づ๑•ᴗ•๑)づ♡",
  "(˶ᵔ ᵕ ᵔ˶)",
  "₍^. .^₎⟆",
  "(๑ > ᴗ < ๑)",
  "(*ᴗ͈ˬᴗ͈)ꕤ*.ﾟ",
  "(❀❛ ֊ ❛„)♡",
  "(˶˃ ᵕ ˂˶)",
  "(,,>﹏<,,)",
  "₍ᐢ. ̫ .ᐢ₎",
  "(づ ᴗ _ᴗ)づ♡",
  "ε(´｡•᎑•`)っ",
  "٩(ˊᗜˋ*)و ♡",
  "ヾ( ˃ᴗ˂ )◞ • *✰",
  "(˵ •̀ ᴗ - ˵ ) ✧",
  "(づ˶•༝•˶)づ♡",
  "(✿◡‿◡)",
  "ฅ^•ﻌ•^ฅ",
  "◝(ᵔᵕᵔ)◜",
  "(˶˃⩊˂˶)",
  "( ˘͈ ᵕ ˘͈♡)",
  "ʕ •ᴥ•ʔ",
  "ʕ•ᴥ•ʔっ♡",
  "(✿◕◡◕)(◕◡◕✿)",
  "( ๑ ˃̵ᴗ˂̵)و ♡",
  "(´｡• ◡ •｡`) ♡",
  "ฅ^>⩊<^ ฅ",
  "(づ｡◕‿‿◕｡)づ",
  "<(˶ᵔᵕᵔ˶)>",
  "◝(ᵔᗜᵔ)◜",
  "( • ᴗ - ) ✧",
  "ฅ/ᐠ. ̫ .ᐟ\\ฅ",
  "(✿◠ᴗ◠)",
  "(っ◔◡◔)っ",
  "(ˊ•͈ ◡ •͈ˋ)",
  "(♡ˊ͈ ꒳ ˋ͈)",
  "૮꒰ ˶• ༝ •˶꒱ა ♡",
  "(ㅅ´ ˘ `)",
  "ദ്ദി(ᵔᗜᵔ)",
  "(∩˃o˂∩)♡",
  "(๑•᎑•๑)",
  "(ᵕ • ᴗ •)",
  "₍ᐢ. .ᐢ₎ ₊˚⊹♡",
  "ଘ(੭*ˊᵕˋ)੭* ੈ♡‧₊˚",
  "૮ ᴖﻌᴖა",
  "(づ◡﹏◡)づ",
  "(❁ᴗ͈ˬᴗ͈)",
  "(๑ᵔ⤙ᵔ๑)",
  "ପ૮๑ᵔ ᵕ ᵔ๑ აଓ",
  "(づ˶˃⤙˂˶)づ",
  "(づᴗ _ᴗ)づ♡",
  "⋆｡˚ ☁︎ ˚｡⋆｡˚☽˚｡⋆",
  "✩₊˚.⋆☾⋆⁺₊✧",
  "*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚",
  "｡ ₊°༺♡༻°₊ ｡",
  "⋆｡‧˚ʚɞ˚‧｡⋆",
  "⋆ ˚｡ ⋆୨♡୧⋆ ˚｡ ⋆",
  "⋆˙⟡ ⋆.˚ ⊹₊⟡ ⋆",
  "°❀⋆.ೃ࿔*:･",
  "˖⁺‧₊˚♡˚₊‧⁺˖",
  "✦•┈๑⋅⋯ ⋯⋅๑┈•✦",
  "────୨ৎ────",
  "♡ ༘*.ﾟ",
  "₊˚⊹♡",
  "⊹₊⟡⋆",
  "⋆✴︎˚｡⋆",
  "✮⋆˙",
  "✧₊⁺",
  "₊˚⊹ ᰔ",
  "˗ˏˋ ★ ˎˊ˗",
  "「 ✦ ✦ 」",
  "✿",
] as const;

const PAPER_ORDER: PaperMode[] = ["cream", "cyanotype", "vellum"];
const PAPER_GLYPH: Record<PaperMode, string> = {
  cream: "▧",
  cyanotype: "▩",
  vellum: "▨",
};
const PAPER_TOKENS: Record<PaperMode, Record<string, string>> = {
  cream: {
    "--site-paper": "#EDE7DA",
    "--site-ink": "#1C1B18",
    "--site-accent": "#1C1B18",
  },
  cyanotype: {
    "--site-paper": "#12344d",
    "--site-ink": "#c8eff2",
    "--site-accent": "#8edbe5",
  },
  vellum: {
    "--site-paper": "#e6e9e6",
    "--site-ink": "#242725",
    "--site-accent": "#55605b",
  },
};

const StudioContext = createContext<StudioContextValue>({
  studioActive: false,
  paper: "cream",
  stampMode: false,
  stamps: [],
  nextStamp: STAMPS[0],
  soundEnabled: false,
  moved: false,
  resetToken: 0,
  cyclePaper: () => undefined,
  toggleStampMode: () => undefined,
  addStamp: () => undefined,
  clearStamps: () => undefined,
  toggleSound: () => undefined,
  markMoved: () => undefined,
  resetTable: () => undefined,
  playSound: () => undefined,
});

export function useCreativeStudio() {
  return useContext(StudioContext);
}

function makeAudioHit(context: AudioContext, kind: StudioSound) {
  const now = context.currentTime;
  const gain = context.createGain();
  gain.connect(context.destination);

  if (kind === "drag" || kind === "stamp") {
    const duration = kind === "drag" ? 0.12 : 0.08;
    const frameCount = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i += 1) {
      const envelope = 1 - i / frameCount;
      data[i] = (Math.random() * 2 - 1) * envelope;
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = kind === "stamp" ? 190 : 850;
    filter.Q.value = kind === "stamp" ? 0.8 : 1.8;
    gain.gain.setValueAtTime(kind === "stamp" ? 0.045 : 0.018, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    source.start(now);
    source.stop(now + duration);
    return;
  }

  const oscillator = context.createOscillator();
  oscillator.type = kind === "paper" ? "sine" : "triangle";
  oscillator.frequency.setValueAtTime(
    kind === "paper" ? 245 : kind === "flip" ? 330 : 520,
    now,
  );
  oscillator.frequency.exponentialRampToValueAtTime(
    kind === "paper" ? 178 : kind === "flip" ? 460 : 420,
    now + 0.075,
  );
  gain.gain.setValueAtTime(kind === "hover" ? 0.012 : 0.025, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
  oscillator.connect(gain);
  oscillator.start(now);
  oscillator.stop(now + 0.095);
}

export function CreativeStudioProvider({ children }: { children: React.ReactNode }) {
  const [paper, setPaper] = useState<PaperMode>("cream");
  const [stampMode, setStampMode] = useState(false);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [stampIndex, setStampIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [moved, setMoved] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const audioRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(false);
  const stampId = useRef(0);
  const paperEffectMounted = useRef(false);

  const playSound = useCallback((kind: StudioSound, force = false) => {
    if (!soundEnabledRef.current && !force) return;
    const AudioCtor = window.AudioContext;
    const context = audioRef.current ?? new AudioCtor();
    audioRef.current = context;
    if (context.state === "suspended") void context.resume();
    makeAudioHit(context, kind);
  }, []);

  const cyclePaper = useCallback(() => {
    setPaper((current) => {
      const next = PAPER_ORDER[(PAPER_ORDER.indexOf(current) + 1) % PAPER_ORDER.length];
      return next;
    });
    playSound("paper");
  }, [playSound]);

  const toggleStampMode = useCallback(() => {
    setStampMode((current) => !current);
  }, []);

  const addStamp = useCallback((x: number, y: number) => {
    const symbol = STAMPS[stampIndex % STAMPS.length];
    stampId.current += 1;
    const stamp: Stamp = {
      id: stampId.current,
      symbol,
      x,
      y,
      rotate: -9 + Math.random() * 18,
      scale: 0.86 + Math.random() * 0.3,
      opacity: 0.18 + Math.random() * 0.12,
    };
    setStamps((current) => [...current.slice(-13), stamp]);
    // 17 e 74 são coprimos: a coleção aparece intercalada, mas todos os
    // carimbos passam pela mesa antes de a sequência recomeçar.
    setStampIndex((current) => (current + 17) % STAMPS.length);
    playSound("stamp");
  }, [playSound, stampIndex]);

  const clearStamps = useCallback(() => {
    setStamps([]);
    playSound("paper");
  }, [playSound]);

  const toggleSound = useCallback(() => {
    const next = !soundEnabledRef.current;
    soundEnabledRef.current = next;
    setSoundEnabled(next);
    if (next) playSound("hover", true);
  }, [playSound]);

  const markMoved = useCallback(() => setMoved(true), []);

  const resetTable = useCallback(() => {
    setResetToken((current) => current + 1);
    setMoved(false);
    playSound("paper");
  }, [playSound]);

  useEffect(() => {
    document.documentElement.dataset.stampMode = stampMode ? "true" : "false";
    return () => {
      delete document.documentElement.dataset.stampMode;
    };
  }, [stampMode]);

  useEffect(() => {
    // O HTML já nasce com os tokens de "cream". Reescrevê-los na primeira
    // hidratação invalida os estilos da página inteira e posterga o LCP.
    if (!paperEffectMounted.current) {
      paperEffectMounted.current = true;
      return;
    }

    const root = document.documentElement;
    root.dataset.paper = paper;
    Object.entries(PAPER_TOKENS[paper]).forEach(([name, value]) => {
      root.style.setProperty(name, value);
    });
    return () => {
      delete root.dataset.paper;
      Object.keys(PAPER_TOKENS[paper]).forEach((name) => root.style.removeProperty(name));
    };
  }, [paper]);

  const value = useMemo<StudioContextValue>(() => ({
    studioActive: true,
    paper,
    stampMode,
    stamps,
    nextStamp: STAMPS[stampIndex % STAMPS.length],
    soundEnabled,
    moved,
    resetToken,
    cyclePaper,
    toggleStampMode,
    addStamp,
    clearStamps,
    toggleSound,
    markMoved,
    resetTable,
    playSound,
  }), [
    addStamp,
    clearStamps,
    cyclePaper,
    markMoved,
    moved,
    paper,
    playSound,
    resetTable,
    resetToken,
    soundEnabled,
    stampIndex,
    stampMode,
    stamps,
    toggleSound,
    toggleStampMode,
  ]);

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

const controlsStyles = `
  .cs-tools {
    position: fixed;
    z-index: 970;
    left: auto;
    right: 1.1rem;
    top: 50%;
    translate: 0 -50%;
    display: flex;
    flex-direction: column;
    gap: .45rem;
    padding: .4rem;
    background-color: var(--paper-sheet);
    background-image:
      repeating-linear-gradient(0deg, transparent 0 3px, color-mix(in srgb, var(--ink) 2.5%, transparent) 3px 4px),
      url("/img/paper-noise.webp");
    background-size: 100% 100%, 130px 130px;
    border: 1px solid var(--paper-edge);
    box-shadow: 4px 5px 0 var(--paper-shadow);
  }
  .cs-tool {
    position: relative;
    min-width: var(--tap-min);
    min-height: var(--tap-min);
    display: grid;
    place-items: center;
    padding: .35rem .48rem;
    color: var(--ink);
    background: transparent;
    border: 1px solid transparent;
    font-family: var(--font-mono), monospace;
    font-size: var(--type-label);
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    font-variant-emoji: text;
    transition: background .2s ease, color .2s ease, transform .2s ease, border-color .2s ease;
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink) 8%, transparent);
  }
  .cs-tool:hover,
  .cs-tool[aria-pressed="true"] {
    color: var(--paper);
    background: var(--ink);
    transform: rotate(-2deg);
    box-shadow: 2px 3px 0 color-mix(in srgb, var(--ink) 16%, transparent);
  }
  .cs-tool:active { transform: translate(2px, 2px) rotate(0); box-shadow: none; }
  .cs-tool:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 3px;
  }
  .cs-tool--pop {
    animation: cs-tool-pop .24s cubic-bezier(.16, 1, .3, 1) both;
  }
  @keyframes cs-tool-pop {
    from { opacity: 0; transform: scale(.6); }
    to { opacity: 1; transform: scale(1); }
  }
  .cs-tool--drawer { display: none; }
  .cs-tool::after {
    content: attr(data-tip);
    position: absolute;
    left: auto;
    right: calc(100% + .72rem);
    top: 50%;
    translate: .3rem -50%;
    width: max-content;
    max-width: 11rem;
    padding: .32rem .5rem;
    border: 1px solid color-mix(in srgb, var(--ink) 28%, transparent);
    background: color-mix(in srgb, var(--paper) 94%, transparent);
    color: var(--ink);
    font-family: var(--font-head);
    font-style: italic;
    font-size: var(--type-micro);
    font-weight: 400;
    letter-spacing: .02em;
    text-transform: lowercase;
    box-shadow: 3px 3px 0 color-mix(in srgb, var(--ink) 9%, transparent);
    opacity: 0;
    pointer-events: none;
    transition: opacity .18s ease, translate .25s ease;
  }
  .cs-tool:hover::after,
  .cs-tool:focus-visible::after {
    opacity: 1;
    translate: 0 -50%;
  }
  @media (max-width: 720px) {
    .cs-tools {
      top: 4.8rem;
      left: auto;
      right: .7rem;
      bottom: auto;
      translate: none;
      gap: .22rem;
      padding: .28rem;
    }
    .cs-tool {
      min-width: var(--tap-min);
      min-height: var(--tap-min);
      padding: .35rem .45rem;
      font-size: var(--type-label);
    }
    .cs-tool--drawer { display: grid; }
    .cs-tools[data-open="false"] .cs-tool:not(.cs-tool--drawer) { display: none; }
    .cs-tool::after {
      left: auto;
      right: calc(100% + .55rem);
      translate: .3rem -50%;
    }
    .cs-tool:hover::after,
    .cs-tool:focus-visible::after { translate: 0 -50%; }
  }
  @media (prefers-reduced-motion: reduce) {
    .cs-tool { transition: none; animation: none !important; }
  }
`;

export function CreativeStudioControls() {
  const [open, setOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const {
    paper,
    stampMode,
    stamps,
    moved,
    cyclePaper,
    toggleStampMode,
    clearStamps,
    resetTable,
  } = useCreativeStudio();

  useEffect(() => {
    const hero = document.querySelector(".ph");
    if (!hero) return;
    const frame = requestAnimationFrame(() => {
      const rect = hero.getBoundingClientRect();
      setHeroVisible(rect.bottom > 0 && rect.top < window.innerHeight);
    });
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: .04 },
    );
    observer.observe(hero);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  if (!heroVisible) return null;

  return (
    <aside
      className="cs-tools"
      aria-label="Ateliê interativo"
      data-no-stamp
      data-open={open ? "true" : "false"}
    >
      <style>{controlsStyles}</style>
      <button
        type="button"
        className="cs-tool cs-tool--drawer hover-trigger"
        aria-label={open ? "Fechar ferramentas" : "Abrir ferramentas"}
        aria-expanded={open}
        data-tip="ferramentas"
        onClick={() => setOpen((current) => !current)}
      >
        [ ⁝ ]
      </button>
      <button
        type="button"
        className="cs-tool hover-trigger"
        aria-label="Alternar tipo de papel"
        data-tip="papel"
        onClick={cyclePaper}
      >
        [ {PAPER_GLYPH[paper]} ]
      </button>
      <button
        type="button"
        className="cs-tool hover-trigger"
        aria-label="Ativar carimbos"
        aria-pressed={stampMode}
        data-tip="carimbar"
        onClick={toggleStampMode}
      >
        [ {stampMode ? "❀" : "✿"} ]
      </button>
      {stamps.length > 0 && (
          <button
            type="button"
            className="cs-tool cs-tool--pop hover-trigger"
            aria-label="Limpar carimbos"
            data-tip="limpar"
            onClick={clearStamps}
          >
            [ ✕ ]
          </button>
      )}
      {moved && (
          <button
            type="button"
            className="cs-tool cs-tool--pop hover-trigger"
            aria-label="Reorganizar os objetos"
            data-tip="reorganizar"
            onClick={resetTable}
          >
            [ ↺ ]
          </button>
      )}
    </aside>
  );
}

function stampFontSize(symbol: string) {
  const length = Array.from(symbol).length;

  if (length > 24) return "clamp(.58rem, .78vw, .78rem)";
  if (length > 17) return "clamp(.66rem, .92vw, .9rem)";
  if (length > 11) return "clamp(.74rem, 1.08vw, 1.08rem)";
  return "clamp(.86rem, 1.4vw, 1.35rem)";
}

const stampStyles = `
  .cs-stamp-layer {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
  }
  .cs-stamp {
    position: absolute;
    translate: -50% -50%;
    color: var(--ink);
    font-family: var(--font-mono), monospace;
    line-height: 1;
    white-space: pre;
    user-select: none;
    font-variant-emoji: text;
    mix-blend-mode: multiply;
    transform-origin: center;
    text-shadow: .65px .45px 0 color-mix(in srgb, var(--ink) 24%, transparent);
    will-change: transform, opacity, filter;
    opacity: var(--stamp-opacity, .6);
    scale: var(--stamp-scale, 1);
    animation: cs-stamp-in .43s cubic-bezier(.16, 1, .3, 1) both;
  }
  @keyframes cs-stamp-in {
    0% {
      opacity: 0;
      scale: calc(var(--stamp-scale, 1) * 1.52);
      filter: blur(1.2px);
    }
    40% {
      opacity: min(.48, calc(var(--stamp-opacity, .6) * 1.72));
      scale: calc(var(--stamp-scale, 1) * .88);
      filter: blur(.18px);
    }
    72% {
      opacity: calc(var(--stamp-opacity, .6) * 1.14);
      scale: calc(var(--stamp-scale, 1) * 1.035);
      filter: blur(.05px);
    }
    100% {
      opacity: var(--stamp-opacity, .6);
      scale: var(--stamp-scale, 1);
      filter: blur(0);
    }
  }
  .cs-stamp::after {
    content: attr(data-ink);
    position: absolute;
    inset: 0;
    translate: .7px .45px;
    color: currentColor;
    opacity: .12;
    filter: blur(.22px);
    pointer-events: none;
  }
  .rm[data-paper="cyanotype"] .cs-stamp { mix-blend-mode: screen; }
  .cs-stamp-preview {
    position: fixed;
    z-index: 10001;
    top: 0;
    left: 0;
    opacity: 0;
    translate: -50% -50%;
    color: var(--ink);
    font-family: var(--font-mono), monospace;
    font-size: 1rem;
    white-space: nowrap;
    pointer-events: none;
    font-variant-emoji: text;
    transition: opacity .15s ease;
  }
  .ph[data-stamp-active="true"] { touch-action: manipulation; }
  @media (prefers-reduced-motion: reduce) {
    .cs-stamp-preview { display: none; }
  }
`;

export function StampCanvas() {
  const { stampMode, stamps, nextStamp, addStamp } = useCreativeStudio();
  const layerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const hero = layer?.closest<HTMLElement>(".ph");
    if (!layer || !hero) return;

    const onMove = (event: PointerEvent) => {
      const preview = previewRef.current;
      if (!preview || !stampMode || event.pointerType === "touch") return;
      preview.style.opacity = "0.34";
      preview.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };
    const onLeave = () => {
      if (previewRef.current) previewRef.current.style.opacity = "0";
    };
    const onDown = (event: PointerEvent) => {
      if (!stampMode || event.button !== 0) return;
      const target = event.target as HTMLElement;
      if (target.closest("a, button, input, textarea, select, [data-no-stamp]")) return;
      const rect = hero.getBoundingClientRect();
      addStamp(
        ((event.clientX - rect.left) / rect.width) * 100,
        ((event.clientY - rect.top) / rect.height) * 100,
      );
    };

    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    hero.addEventListener("pointerdown", onDown);
    return () => {
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      hero.removeEventListener("pointerdown", onDown);
    };
  }, [addStamp, stampMode]);

  return (
    <>
      <style>{stampStyles}</style>
      <div className="cs-stamp-layer" ref={layerRef} aria-hidden="true">
          {stamps.map((stamp) => (
            <span
              key={stamp.id}
              className="cs-stamp"
              data-ink={stamp.symbol}
              style={{
                left: `${stamp.x}%`,
                top: `${stamp.y}%`,
                rotate: `${stamp.rotate}deg`,
                fontSize: stampFontSize(stamp.symbol),
                "--stamp-opacity": stamp.opacity,
                "--stamp-scale": stamp.scale,
              } as React.CSSProperties}
            >
              {stamp.symbol}
            </span>
          ))}
      </div>
      <span
        ref={previewRef}
        className="cs-stamp-preview"
        style={{ fontSize: stampFontSize(nextStamp) }}
        aria-hidden="true"
      >
        {nextStamp}
      </span>
    </>
  );
}
