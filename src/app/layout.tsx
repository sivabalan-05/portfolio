import type { Metadata } from "next";
import { Space_Mono, Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import FloatingBackToTop from "@/components/FloatingBackToTop";
import AdaptiveCursor from "@/components/AdaptiveCursor";
import DesktopLoreWarning from "@/components/DesktopLoreWarning";
import { PageTransitionProvider } from "@/components/Curtains";
import { LanguageProvider } from "@/i18n/LanguageContext";

const aeonik = localFont({
  src: [
    { path: "./fonts/Aeonik-Regular-site.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Aeonik-Bold-site.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-head",
  display: "optional",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

/* Custom local typography (files located in src/app/fonts/) */
const seratonin = localFont({
  src: "./fonts/Seratonin.otf",
  variable: "--font-hand",
  display: "swap",
  preload: false,
});

/* Braille Unicode glyphs (U+2800–U+28FF) for crisp cross-platform rendering:
   Custom optimized subset ensuring ASCII and Braille art render cleanly across all operating systems. */
const braille = localFont({
  src: "./fonts/BrailleMono.woff2",
  variable: "--font-braille",
  display: "block",
  preload: false,
});

const offBit = localFont({
  src: "./fonts/OffBit-DotBold-site.woff2",
  weight: "700",
  style: "normal",
  variable: "--font-offbit",
  display: "optional",
  fallback: ["monospace"],
});

const emoji = localFont({
  src: "./fonts/EmojiFont.woff2",
  variable: "--font-emoji",
  display: "swap",
  preload: false,
});

const editorialNew = localFont({
  src: [
    { path: "./fonts/PPEditorialNew-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/PPEditorialNew-Italic.otf", weight: "400", style: "italic" },
    { path: "./fonts/PPEditorialNew-Ultrabold.otf", weight: "800", style: "normal" },
    { path: "./fonts/PPEditorialNew-UltraboldItalic.otf", weight: "800", style: "italic" },
  ],
  variable: "--font-editorial",
  display: "swap",
  preload: false,
});

const performanceTierScript = `
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = Boolean(connection && connection.saveData);
  const network = connection && connection.effectiveType;
  const slowNetwork = network === "slow-2g" || network === "2g";
  const memory = navigator.deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const handheld = matchMedia("(pointer: coarse)").matches &&
    !matchMedia("(any-pointer: fine)").matches;
  const constrainedHardware =
    handheld && (
      (typeof memory === "number" && memory <= 2) ||
      (typeof cores === "number" && cores <= 2)
    );

  let tier = reduce ||
    (handheld && (saveData || slowNetwork || constrainedHardware))
    ? "lite"
    : "full";
  root.dataset.motion = tier;

  const setTier = (next) => {
    if (tier === next) return;
    tier = next;
    root.dataset.motion = next;
    dispatchEvent(new Event("portfolio:motion-tier"));
  };

  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  motionQuery.addEventListener("change", (event) => {
    if (event.matches) setTier("lite");
  });

  if (tier === "full" && handheld) {
    const measureSettledFrames = () => {
      let previous = performance.now();
      let slowFrames = 0;
      let samples = 0;
      const sample = (now) => {
        const elapsed = now - previous;
        previous = now;
        samples += 1;
        if (elapsed > 40) slowFrames += 1;
        if (samples < 12) requestAnimationFrame(sample);
        else if (slowFrames >= 5) setTier("lite");
      };
      requestAnimationFrame(sample);
    };

    const scheduleMeasurement = () => {
      setTimeout(measureSettledFrames, 800);
    };
    if (document.readyState === "complete") scheduleMeasurement();
    else addEventListener("load", scheduleMeasurement, { once: true });
  }
})();
`;

export const metadata: Metadata = {
  title: "Sivabalan D | Information Technology Engineer & Full Stack Developer",
  description: "Personal portfolio of Sivabalan D. Information Technology student and Full Stack / AI Developer skilled in Python, React, FastAPI, Spring Boot, PyTorch, and MySQL.",
  keywords: ["Sivabalan D", "Sivabalan", "Information Technology", "Full Stack Developer", "Python", "React", "FastAPI", "Portfolio"],
  authors: [{ name: "Sivabalan D" }],
  openGraph: {
    title: "Sivabalan D | IT Engineer & Full Stack Developer",
    description: "Personal portfolio of Sivabalan D. Full Stack Web Development, AI Applications, and IoT Systems.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${aeonik.variable} ${instrumentSerif.variable} ${spaceMono.variable} ${seratonin.variable} ${braille.variable} ${offBit.variable} ${emoji.variable} ${editorialNew.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: performanceTierScript }} />
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="https://use.typekit.net/af/c7c109/0000000000000000774f2b0a/31/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <style>{`
          @font-face {
            font-family: "pf-pixelscript";
            src: url("https://use.typekit.net/af/c7c109/0000000000000000774f2b0a/31/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3") format("woff2");
            font-display: optional;
            font-style: normal;
            font-weight: 400;
            font-stretch: normal;
          }
        `}</style>
      </head>
      <body className="antialiased">
        <Script id="typekit-stylesheet" strategy="afterInteractive">
          {`
            const loadTypekit = () => {
              if (document.querySelector('link[data-typekit="knv7rew"]')) return;
              const typekit = document.createElement("link");
              typekit.rel = "stylesheet";
              typekit.href = "https://use.typekit.net/knv7rew.css";
              typekit.dataset.typekit = "knv7rew";
              document.head.appendChild(typekit);
            };
            addEventListener("pointerdown", loadTypekit, { once: true, passive: true });
            addEventListener("keydown", loadTypekit, { once: true });
          `}
        </Script>
        <LanguageProvider>
          <DesktopLoreWarning />
          <SmoothScroll>
            {/* Cursor fica FORA do PageTransitionProvider de propósito: o wrapper de
                transição aplica transform durante a saída, o que quebraria o
                position:fixed do canvas. Aqui ele também não some no fade da troca de página. */}
            <AdaptiveCursor />
            <div
              aria-hidden="true"
              data-paper-grain="global"
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 950,
                pointerEvents: "none",
                backgroundImage: "url('/img/paper-noise.webp')",
                backgroundSize: "180px 180px",
                opacity: 0.065,
                mixBlendMode: "multiply",
              }}
            />
            <PageTransitionProvider>
              {children}
              <FloatingBackToTop />
            </PageTransitionProvider>
          </SmoothScroll>
        </LanguageProvider>
      </body>
    </html>
  );
}
