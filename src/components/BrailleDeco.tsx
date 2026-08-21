"use client";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Ornamento em arte braille (as que ela escolheu). Separado do AsciiAnim porque
 * as exigências de renderização são outras:
 *
 * - fonte: SÓ a BrailleMono tem os glifos (var(--font-braille)); a mono do site
 *   não tem. Sem isso é tofu.
 * - line-height 1: o glifo braille já é desenhado do topo à base da célula, então
 *   qualquer entrelinha extra abre fresta horizontal e o desenho vira listra.
 * - letter-spacing 0: idem na horizontal.
 *
 * Largura = cols * 0.732em (avanço do glifo no DejaVu, 1500/2048).
 *
 * "Acorda ao passar" (pedido dela): ao entrar na viewport, os caracteres
 * embaralham em braille aleatório e RESOLVEM no desenho — como um sinal sendo
 * captado. Usa setInterval (não rAF), então funciona mesmo em abas/painéis com
 * requestAnimationFrame pausado. Espaços e quebras de linha ficam intactos pra
 * não deformar o desenho.
 */
const BRAILLE_BASE = 0x2800; // U+2800..U+28FF = 256 padrões de braille

export default function BrailleDeco({
  art,
  fontSize,
  opacity = 0.5,
  color = "var(--ink)",
  className,
  style,
}: {
  art: string;
  /** número = px; string pra escalar com a viewport (clamp/vw/vh) */
  fontSize: number | string;
  opacity?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLPreElement>(null);
  const [display, setDisplay] = useState(art);
  const [awake, setAwake] = useState(false);

  useEffect(() => { setDisplay(art); }, [art]);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) {
      setAwake(true);
      setDisplay(art);
      return;
    }

    let interval: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setAwake(true);

        const chars = Array.from(art);
        // só embaralha glifos "de verdade"; espaços/quebras seguram a forma
        const idx: number[] = [];
        chars.forEach((c, i) => {
          if (c !== " " && c !== "\n" && c !== "\t") idx.push(i);
        });

        let step = 0;
        const steps = 13;
        interval = setInterval(() => {
          step += 1;
          const settled = step / steps; // 0 → 1: fração já resolvida
          const out = chars.slice();
          for (const i of idx) {
            if (Math.random() > settled) {
              out[i] = String.fromCharCode(BRAILLE_BASE + ((Math.random() * 256) | 0));
            }
          }
          setDisplay(out.join(""));
          if (step >= steps) {
            clearInterval(interval);
            setDisplay(art); // garante o desenho exato no fim
          }
        }, 45);
      },
      { rootMargin: "-60px 0px" },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (interval) clearInterval(interval);
    };
  }, [art, reduceMotion]);

  return (
    <pre
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{
        fontFamily: "var(--font-braille), monospace",
        fontSize,
        lineHeight: 1,
        letterSpacing: 0,
        color,
        whiteSpace: "pre",
        userSelect: "none",
        pointerEvents: "none",
        margin: 0,
        opacity: awake ? opacity : 0,
        transform: awake ? "translateY(0)" : "translateY(22px)",
        transition: "opacity .5s ease, transform .9s cubic-bezier(.16,1,.3,1)",
        ...style,
      }}
    >
      {display}
    </pre>
  );
}
