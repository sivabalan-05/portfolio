"use client";
import { useEffect, useRef, useState } from "react";
import PlaygroundHero from "@/components/PlaygroundHero";
import ScatteredWorks from "@/components/ScatteredWorks";
import { useProjects } from "@/components/useProjects";
import Marquee from "@/components/Marquee";
import AdaptiveKanagawa from "@/components/AdaptiveKanagawa";
import AsciiDivider from "@/components/AsciiDivider";
import ScatterMenu, { type MenuItem } from "@/components/ScatterMenu";
import EditorialFooter from "@/components/EditorialFooter";
import SiteHeader from "@/components/SiteHeader";
import {
  CreativeStudioProvider,
  useCreativeStudio,
} from "@/components/CreativeStudio";
import SkillConstellation from "@/components/SkillConstellation";
import HeroPortrait from "@/components/HeroPortrait";
import {
  personalInfo,
  marqueeSkills,
  skillCategories,
  constellationSkills,
  experienceList,
  educationList,
} from "@/data/portfolioData";

const STITCH_DIVIDER = "------  ";

const rmStyles = `
  .rm {
    --ink: var(--site-ink);
    --paper: var(--site-paper);
    --acid: var(--site-accent);
    --hero-highlight: #75332f;
    --hero-art-lift: 0rem;
    --font-grotesk: Arial, "Helvetica Neue", Helvetica, sans-serif;
    background:
      radial-gradient(1100px 700px at 18% -5%, var(--site-tint-a) 0%, transparent 60%),
      radial-gradient(900px 600px at 100% 30%, var(--site-tint-b) 0%, transparent 55%),
      radial-gradient(1000px 800px at 50% 105%, var(--site-tint-c) 0%, transparent 55%),
      var(--paper);
    color: var(--ink);
    overflow-x: hidden;
    position: relative;
    transition: background-color .65s ease, color .65s ease;
  }
  .rm[data-paper="cyanotype"] {
    --site-paper: #12344d;
    --site-ink: #c8eff2;
    --site-accent: #8edbe5;
    --site-tint-a: #173e59;
    --site-tint-b: #0c263d;
    --site-tint-c: #1a4961;
    --site-accent-rgb: 142, 219, 229;
    --hero-highlight: #e38b82;
  }
  .rm[data-paper="vellum"] {
    --site-paper: #e6e9e6;
    --site-ink: #242725;
    --site-accent: #55605b;
    --site-tint-a: #f4f6f3;
    --site-tint-b: #d4dad6;
    --site-tint-c: #edf0ed;
    --site-accent-rgb: 85, 96, 91;
    --hero-highlight: #914d48;
  }
  .rm[data-paper="cyanotype"]::after {
    opacity: .11;
    mix-blend-mode: screen;
  }
  .rm[data-paper="vellum"]::after { opacity: .045; }
  .rm .rm-idle {
    color: color-mix(in srgb, var(--ink) 17%, transparent);
  }
  .rm .rm-thread { opacity: .36; }
  .rm .ph__sticker { filter: contrast(1.12); }
  .rm::after {
    content: "";
    position: fixed;
    inset: 0;
    z-index: 5;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    opacity: .07;
    mix-blend-mode: multiply;
  }
  .rm *::selection { background: #843f3a; color: #fff8ec; }
  .px-line {
    background-image: repeating-linear-gradient(90deg, var(--ink) 0 6px, transparent 6px 12px);
    background-size: 100% 2px;
    background-repeat: no-repeat;
  }

  .rm-field {
    position: absolute;
    inset: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    color: var(--ink);
    font-family: var(--font-mono), monospace;
    transform: none;
  }
  .rm-thread {
    position: absolute;
    z-index: 2;
    top: 100svh;
    left: .85rem;
    width: 4.1rem;
    height: calc(100% - 100svh - 22rem);
    color: var(--ink);
    opacity: .24;
    pointer-events: none;
    transition: opacity .55s ease;
  }
  .rm-thread svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .rm-thread__holes { opacity: .34; }
  .rm-thread__line {
    opacity: .76;
    filter: drop-shadow(1px 0 0 color-mix(in srgb, var(--paper) 86%, transparent));
  }
  .rm-spine {
    position: fixed;
    top: 0; bottom: 0; left: 1.8rem;
    width: 1px;
    z-index: 80;
    pointer-events: none;
    user-select: none;
    opacity: .28;
    background-image: repeating-linear-gradient(180deg, var(--ink) 0 5px, transparent 5px 12px);
  }
  .rm-thread__knot {
    position: absolute;
    left: 50%;
    translate: -50% -50%;
    display: grid;
    place-items: center;
    width: 1.05rem;
    height: 1.05rem;
    color: var(--ink);
    background: var(--paper);
    border: 1px solid color-mix(in srgb, var(--ink) 20%, transparent);
    font-family: var(--font-mono), monospace;
    font-size: .62rem;
    line-height: 1;
    box-shadow: 2px 2px 0 color-mix(in srgb, var(--ink) 8%, transparent);
  }
  .rm-guide {
    position: absolute;
    z-index: 4;
    font-family: var(--font-mono), monospace;
    font-size: 1.15rem;
    color: var(--ink);
    opacity: .46;
    animation: rm-guide 9s ease-in-out infinite;
  }
  @keyframes rm-guide {
    0%, 100% { rotate: 0deg; scale: 1; }
    50% { rotate: 70deg; scale: 1.14; }
  }

  /* --- Sections --- */
  .rm-sec {
    padding: 6rem 5.5rem;
    scroll-margin-top: 6.5rem;
    content-visibility: auto;
    contain-intrinsic-size: auto 900px;
  }
  .rm-label {
    font-family: var(--font-body);
    font-size: clamp(1.05rem, .95rem + .55vw, 1.45rem);
    text-transform: lowercase; letter-spacing: .08em;
    display: flex; justify-content: space-between;
    padding-bottom: .55rem; margin-bottom: 0;
  }
  .rm-divider { margin-bottom: 3rem; }
  .rm-statement {
    font-family: var(--font-grotesk); font-weight: 700;
    font-size: clamp(1.6rem, 3.8vw, 3.2rem);
    line-height: 1.12; letter-spacing: -0.03em;
    text-transform: lowercase;
    max-width: 24ch;
  }
  .rm-about { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); gap: 4rem; align-items: start; }
  .rm-about-copy { min-width: 0; display: flex; flex-direction: column; gap: 1.5rem; }
  .rm-about-para {
    font-family: var(--font-body);
    font-size: 1.05rem;
    line-height: 1.68;
    opacity: 0.88;
    max-width: 54ch;
  }
  .rm-about-highlights {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }
  .rm-about-item {
    display: flex;
    align-items: baseline;
    gap: 0.65rem;
    font-family: var(--font-body);
    font-size: 0.95rem;
    line-height: 1.5;
    opacity: 0.82;
  }
  .rm-about-dot {
    font-family: var(--font-mono);
    color: var(--acid);
    font-size: 0.75rem;
  }

  /* Skills & Tech Section */
  .rm-skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-top: 1rem;
  }
  .rm-skill-card {
    border: 1px solid color-mix(in srgb, var(--ink) 18%, transparent);
    padding: 1.8rem;
    background: color-mix(in srgb, var(--paper) 70%, transparent);
    backdrop-filter: blur(4px);
    transition: transform 0.25s ease, border-color 0.25s ease;
  }
  .rm-skill-card:hover {
    border-color: var(--ink);
    transform: translateY(-3px);
  }
  .rm-skill-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 1.2rem;
    padding-bottom: 0.6rem;
    border-bottom: 1px dashed color-mix(in srgb, var(--ink) 20%, transparent);
  }
  .rm-skill-num {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    opacity: 0.6;
  }
  .rm-skill-cat {
    font-family: var(--font-body);
    font-weight: 700;
    font-size: 1.1rem;
    letter-spacing: 0.02em;
    text-transform: lowercase;
  }
  .rm-skill-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
  }
  .rm-skill-pill {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    padding: 0.35rem 0.65rem;
    background: color-mix(in srgb, var(--ink) 6%, transparent);
    border: 1px solid color-mix(in srgb, var(--ink) 14%, transparent);
    border-radius: 99px;
    letter-spacing: 0.02em;
  }

  /* Experience & Education Section */
  .rm-exp-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
    gap: 4rem;
  }
  .rm-timeline {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }
  .rm-timeline-item {
    position: relative;
    padding-left: 1.5rem;
    border-left: 1px dashed color-mix(in srgb, var(--ink) 24%, transparent);
  }
  .rm-timeline-item::before {
    content: "✳︎";
    position: absolute;
    left: -0.45rem;
    top: 0.1rem;
    font-size: 0.8rem;
    color: var(--ink);
  }
  .rm-timeline-period {
    font-family: var(--font-mono);
    font-size: 0.76rem;
    letter-spacing: 0.08em;
    opacity: 0.6;
    margin-bottom: 0.3rem;
  }
  .rm-timeline-title {
    font-family: var(--font-body);
    font-weight: 700;
    font-size: 1.2rem;
    margin-bottom: 0.2rem;
  }
  .rm-timeline-org {
    font-family: var(--font-body);
    font-size: 0.92rem;
    opacity: 0.8;
    margin-bottom: 0.8rem;
  }
  .rm-timeline-desc {
    font-family: var(--font-body);
    font-size: 0.95rem;
    line-height: 1.55;
    opacity: 0.85;
    margin-bottom: 0.8rem;
  }
  .rm-timeline-bullets {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding-left: 1rem;
    font-family: var(--font-body);
    font-size: 0.88rem;
    line-height: 1.48;
    opacity: 0.8;
  }
  .rm-mobile-only {
    display: none;
  }
  .rm-desktop-only {
    display: inline-block;
  }

  @media (max-width: 900px) {
    .rm-about { grid-template-columns: 1fr; gap: 2.5rem; }
    .rm-exp-grid { grid-template-columns: 1fr; gap: 3rem; }
    .rm-mobile-only {
      display: block;
    }
    .rm-desktop-only {
      display: none !important;
    }
    .rm-mobile-header {
      margin-top: 3.5rem;
      margin-bottom: 1.5rem;
    }
  }
  @media (max-width: 768px) {
    .rm-spine, .rm-thread {
      display: none !important;
    }
    .rm-sec {
      padding: 3.5rem 1.25rem 5.5rem;
      width: 100%;
      max-width: 100vw;
      box-sizing: border-box;
    }
    .rm-label { margin-bottom: 1.5rem; }
    .rm-divider { margin-bottom: 2rem; }
    .rm-about {
      width: 100%;
      max-width: 100%;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .rm-about-copy {
      width: 100%;
      max-width: 100%;
      min-width: 0;
    }
    .rm-statement {
      font-size: clamp(1.35rem, 5.2vw, 2.1rem);
      line-height: 1.22;
      max-width: 100%;
      word-break: break-word;
      overflow-wrap: break-word;
    }
    .rm-about-para {
      font-size: 0.95rem;
      line-height: 1.62;
      max-width: 100%;
      word-break: break-word;
      overflow-wrap: break-word;
    }
    .rm-about-highlights {
      width: 100%;
      max-width: 100%;
    }
    .rm-about-item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      width: 100%;
      max-width: 100%;
    }
    .rm-about-item span:last-child {
      flex: 1;
      min-width: 0;
      word-break: break-word;
      overflow-wrap: break-word;
      white-space: normal;
    }
    .rm-exp-grid {
      width: 100%;
      max-width: 100%;
    }
    .rm-timeline {
      width: 100%;
      max-width: 100%;
    }
    .rm-timeline-item {
      padding-left: 1.25rem;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      word-break: break-word;
      overflow-wrap: break-word;
    }
    .rm-timeline-desc,
    .rm-timeline-bullets {
      word-break: break-word;
      overflow-wrap: break-word;
    }
  }
`;

export default function Home() {
  return (
    <CreativeStudioProvider>
      <HomeContent />
    </CreativeStudioProvider>
  );
}

function HomeContent() {
  const { paper } = useCreativeStudio();
  const [contactVisible, setContactVisible] = useState(false);
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const headlineInitialized = useRef(false);

  useEffect(() => {
    if (headlineInitialized.current) return;
    headlineInitialized.current = true;

    const indexKey = "portfolio-hero-headline";
    const loadKey = "portfolio-hero-page-load";
    const pageLoad = String(performance.timeOrigin);
    const savedIndex = Number.parseInt(sessionStorage.getItem(indexKey) ?? "-1", 10);
    const samePageLoad = sessionStorage.getItem(loadKey) === pageLoad;
    const count = personalInfo.heroHeadlines.length;
    const currentIndex = Number.isFinite(savedIndex) && savedIndex >= 0 ? savedIndex : 0;
    const nextIndex = samePageLoad
      ? currentIndex % count
      : savedIndex < 0
        ? 0
        : (currentIndex + 1) % count;

    sessionStorage.setItem(indexKey, String(nextIndex));
    sessionStorage.setItem(loadKey, pageLoad);
    setHeadlineIndex(nextIndex);
  }, []);

  useEffect(() => {
    const contact = document.querySelector("#contact");
    if (!contact) return;
    const observer = new IntersectionObserver(
      ([entry]) => setContactVisible(entry.isIntersecting),
      { threshold: .02 },
    );
    observer.observe(contact);
    return () => observer.disconnect();
  }, []);

  const projects = useProjects();
  const heroLines = personalInfo.heroHeadlines[headlineIndex] ?? personalInfo.heroHeadlines[0];

  return (
    <div
      className="rm"
      data-paper={paper}
      data-contact-visible={contactVisible ? "true" : "false"}
    >
      <style>{rmStyles}</style>
      <div className="rm-spine" aria-hidden="true" />

      <div className="rm-thread" aria-hidden="true">
        <svg viewBox="0 0 24 100" preserveAspectRatio="none">
          <path
            className="rm-thread__holes"
            d="M12 0 L12 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeDasharray=".14 1.5"
            vectorEffect="non-scaling-stroke"
          />
          <path
            className="rm-thread__line"
            d="M12 0 C7 6 17 11 12 18 C7 25 17 31 12 39 C7 47 17 54 12 62 C7 70 17 76 12 84 C8 91 15 96 12 100"
            fill="none"
            stroke="currentColor"
            strokeWidth=".85"
            strokeDasharray=".82 .62"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span className="rm-thread__knot" style={{ top: "18%" }}>╳</span>
        <span className="rm-thread__knot" style={{ top: "62%" }}>╳</span>
        <span className="rm-thread__knot" style={{ top: "84%" }}>╳</span>
      </div>

      <SiteHeader />

      <main>
        <PlaygroundHero
          lines={[...heroLines]}
          sub={`${personalInfo.role} — ${personalInfo.location}`}
          subHighlight={personalInfo.name}
          scrollLabel="scroll to explore ↓"
        >
          <AdaptiveKanagawa className="rm-field" opacity={0.3} />
          <HeroPortrait
            src="/img/IMG_6379.png"
            style={{ right: "8%", bottom: "0px" }}
          />
          <ScatterMenu
            items={[
              {
                label: "featured work",
                href: "#work",
                left: "52%",
                top: "22%",
                rotate: 3,
                priority: "primary",
                previews: projects.slice(0, 3).map((p) => ({ src: p.img, alt: p.title })),
              },
              { label: "about me", href: "#about", left: "5.2%", top: "19.2%", rotate: -3, priority: "secondary" },
              { label: "skills & tech", href: "#skills", left: "10%", top: "45%", rotate: 2, priority: "secondary" },
              { label: "get in touch", href: "#contact", left: "82%", top: "72%", rotate: -2, priority: "tertiary" },
            ] satisfies MenuItem[]}
          />
        </PlaygroundHero>

        <Marquee items={marqueeSkills} />

        {/* Selected Work Section */}
        <section id="work" className="rm-sec" style={{ position: "relative" }}>
          <span className="rm-guide" aria-hidden="true" style={{ left: "51%", top: "3.4rem" }}>✳︎</span>
          <div className="rm-label">
            <span>selected projects</span>
            <span>{projects.length.toString().padStart(2, "0")} —</span>
          </div>
          <AsciiDivider className="rm-divider" pattern={STITCH_DIVIDER} fullWidth opacity={0.52} />
          <ScatteredWorks items={projects} />
        </section>

        {/* About Section */}
        <section id="about" className="rm-sec" style={{ position: "relative" }}>
          <span className="rm-guide" aria-hidden="true" style={{ right: "7%", top: "4.5rem", animationDelay: "-3s" }}>✳︎</span>
          <div className="rm-label">
            <span>about me</span>
            <span className="rm-desktop-only">biography & focus</span>
          </div>
          <AsciiDivider className="rm-divider" pattern={STITCH_DIVIDER} fullWidth opacity={0.52} />
          <div className="rm-about">
            <div className="rm-about-copy">
              <h2 className="rm-statement">
                {personalInfo.bio}
              </h2>
              <p className="rm-about-para">
                {personalInfo.aboutExtended}
              </p>
              <div className="rm-about-highlights">
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", letterSpacing: "0.06em", opacity: 0.7, textTransform: "uppercase", marginBottom: "0.2rem" }}>
                  Core Focus Areas
                </p>
                {personalInfo.whatIWorkOn.map((item, idx) => (
                  <div className="rm-about-item" key={idx}>
                    <span className="rm-about-dot">✳</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rm-tools">
              <div className="rm-mobile-only rm-mobile-header">
                <div className="rm-label">
                  <span>biography & focus</span>
                </div>
                <AsciiDivider className="rm-divider" pattern={STITCH_DIVIDER} fullWidth opacity={0.52} />
              </div>
              <SkillConstellation nodes={constellationSkills} />
              <div style={{ marginTop: "2rem" }}>
                <AsciiDivider opacity={0.45} />
                <div style={{ display: "flex", justifyContent: "space-between", padding: ".85rem 0", fontFamily: "var(--font-body)", fontSize: "var(--type-label)", textTransform: "lowercase", letterSpacing: ".06em" }}>
                  <span style={{ opacity: 0.6 }}>status</span>
                  <span style={{ fontWeight: 600 }}>{personalInfo.status}</span>
                </div>
                <AsciiDivider opacity={0.45} />
                <div style={{ display: "flex", justifyContent: "space-between", padding: ".85rem 0", fontFamily: "var(--font-body)", fontSize: "var(--type-label)", textTransform: "lowercase", letterSpacing: ".06em" }}>
                  <span style={{ opacity: 0.6 }}>location</span>
                  <span>{personalInfo.location}</span>
                </div>
                <AsciiDivider opacity={0.45} />
              </div>
            </div>
          </div>
        </section>

        {/* Technical Skills Section */}
        <section id="skills" className="rm-sec" style={{ position: "relative" }}>
          <div className="rm-label">
            <span>technical skill set</span>
            <span>06 domains</span>
          </div>
          <AsciiDivider className="rm-divider" pattern={STITCH_DIVIDER} fullWidth opacity={0.52} />
          <div className="rm-skills-grid">
            {skillCategories.map((cat) => (
              <div className="rm-skill-card hover-trigger" key={cat.num}>
                <div className="rm-skill-header">
                  <span className="rm-skill-cat">{cat.category}</span>
                  <span className="rm-skill-num">{cat.num}</span>
                </div>
                <div className="rm-skill-list">
                  {cat.skills.map((skill) => (
                    <span className="rm-skill-pill" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience & Education Section */}
        <section id="experience" className="rm-sec" style={{ position: "relative" }}>
          <div className="rm-label">
            <span>background</span>
            <span className="rm-desktop-only">experience & education</span>
          </div>
          <AsciiDivider className="rm-divider" pattern={STITCH_DIVIDER} fullWidth opacity={0.52} />
          <div className="rm-exp-grid">
            <div>
              <h3 style={{ fontFamily: "var(--font-body)", fontSize: "1.2rem", fontWeight: 700, textTransform: "lowercase", letterSpacing: "0.04em", marginBottom: "1.5rem" }}>
                professional experience
              </h3>
              <div className="rm-timeline">
                {experienceList.map((exp, idx) => (
                  <div className="rm-timeline-item" key={idx}>
                    <div className="rm-timeline-period">{exp.period} · {exp.location}</div>
                    <div className="rm-timeline-title">{exp.role}</div>
                    <div className="rm-timeline-org">{exp.company}</div>
                    <p className="rm-timeline-desc">{exp.description}</p>
                    <ul className="rm-timeline-bullets">
                      {exp.achievements.map((ach, achIdx) => (
                        <li key={achIdx}>{ach}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="rm-mobile-only rm-mobile-header">
                <div className="rm-label">
                  <span>education</span>
                </div>
                <AsciiDivider className="rm-divider" pattern={STITCH_DIVIDER} fullWidth opacity={0.52} />
              </div>
              <h3 className="rm-desktop-only" style={{ fontFamily: "var(--font-body)", fontSize: "1.2rem", fontWeight: 700, textTransform: "lowercase", letterSpacing: "0.04em", marginBottom: "1.5rem" }}>
                education
              </h3>
              <div className="rm-timeline">
                {educationList.map((edu, idx) => (
                  <div className="rm-timeline-item" key={idx}>
                    <div className="rm-timeline-period">{edu.period} · {edu.location}</div>
                    <div className="rm-timeline-title">{edu.degree}</div>
                    <div className="rm-timeline-org">{edu.institution}</div>
                    {edu.details ? <p className="rm-timeline-desc">{edu.details}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <div id="contact">
        <EditorialFooter />
      </div>
    </div>
  );
}
