"use client";

import Link from "next/link";
import ScrambleText from "./ScrambleText";
import UnderlineButton from "./UnderlineButton";
import { usePathname } from "next/navigation";
import { personalInfo } from "@/data/portfolioData";
import { useCreativeStudio } from "./CreativeStudio";
import { useState, useEffect } from "react";

const styles = `
  .sh {
    position: fixed; top: clamp(1.4rem, 3.2vh, 2.4rem); z-index: 1000;
    font-family: var(--font-body), sans-serif;
    font-size: var(--type-micro); text-transform: lowercase; letter-spacing: .1em;
    color: var(--site-ink, #1C1B18);
    pointer-events: auto;
  }
  .sh--l { left: clamp(1.5rem, 5vw, 5.5rem); display: flex; align-items: center; gap: .8rem; line-height: 1.1; }
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
    background: #238636;
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

  .sh__mobile-actions { display: none; }
  .sh__cv-btn {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: .28rem .58rem;
    border-radius: 4px;
    font-family: var(--font-mono), monospace;
    font-size: .68rem;
    font-weight: 700;
    letter-spacing: .04em;
    background: color-mix(in srgb, var(--site-ink, #1C1B18) 92%, transparent);
    color: var(--site-paper, #ede7da);
    text-decoration: none;
    box-shadow: 0 2px 6px rgba(0,0,0,.15);
    transition: transform .15s ease, background-color .15s ease;
  }
  .sh__cv-btn:active { transform: scale(.94); }

  .sh__mobile-status-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: .25rem .55rem;
    border: 1px solid color-mix(in srgb, var(--site-ink, #1C1B18) 18%, transparent);
    border-radius: 99px;
    font-family: var(--font-mono), monospace;
    font-size: .64rem;
    background: color-mix(in srgb, var(--site-paper, #ede7da) 88%, transparent);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    white-space: nowrap;
  }
  .sh__mobile-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #238636;
    box-shadow: 0 0 5px #238636;
  }
  .sh__mobile-dock { display: none; }

  @media (max-width: 860px) {
    .sh {
      top: 1rem;
      width: 100%;
      left: 0 !important;
      right: 0 !important;
      padding: 0 1rem;
      box-sizing: border-box;
      pointer-events: none;
    }
    .sh--l {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 100%;
      pointer-events: auto;
    }
    .sh--r { display: none; }
    
    .sh__mark {
      font-size: clamp(1.15rem, 5.2vw, 1.45rem);
      line-height: .98;
      padding: .22rem .45rem;
      background: color-mix(in srgb, var(--site-paper, #ede7da) 88%, transparent);
      box-shadow: 0 0 0 .25rem color-mix(in srgb, var(--site-paper, #ede7da) 88%, transparent);
      -webkit-backdrop-filter: blur(5px);
      backdrop-filter: blur(5px);
      border-radius: 2px;
    }

    .sh__mobile-actions {
      display: inline-flex;
      align-items: center;
      gap: .5rem;
      pointer-events: auto;
    }

    .sh__mobile-dock {
      position: fixed;
      bottom: 1.1rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 950;
      display: flex;
      align-items: center;
      gap: 3px;
      padding: 5px 8px;
      background: color-mix(in srgb, var(--site-paper, #ede7da) 84%, transparent);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid color-mix(in srgb, var(--site-ink, #1C1B18) 22%, transparent);
      border-radius: 99px;
      box-shadow:
        0 12px 28px -6px rgba(28, 27, 24, .22),
        0 2px 8px rgba(28, 27, 24, .08),
        inset 0 0 0 1px rgba(255, 255, 255, .35);
      max-width: calc(100vw - 2rem);
      overflow-x: auto;
      pointer-events: auto;
      animation: dock-arrive .5s cubic-bezier(.16, 1, .3, 1) both;
    }

    @keyframes dock-arrive {
      from { transform: translate(-50%, 20px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }

    .sh__dock-item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: .42rem .68rem;
      font-family: var(--font-subtitle), monospace;
      font-size: .78rem;
      font-weight: 700;
      letter-spacing: .02em;
      text-transform: lowercase;
      color: var(--site-ink, #1C1B18);
      text-decoration: none;
      border-radius: 99px;
      white-space: nowrap;
      transition: background-color .18s ease, transform .12s ease;
    }
    .sh__dock-item:active {
      transform: scale(.92);
      background: color-mix(in srgb, var(--site-ink, #1C1B18) 12%, transparent);
    }
    .sh__dock-item--active {
      background: var(--site-ink, #1C1B18);
      color: var(--site-paper, #ede7da);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sh__dot::after,
    .sh__mark .text-star,
    .sh__name::after,
    .sh__mobile-dock { animation: none; }
  }
`;

export default function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";
  const { playSound } = useCreativeStudio();
  const [activeSection, setActiveSection] = useState<string>("work");

  useEffect(() => {
    const sections = ["work", "about", "skills", "experience", "contact"];
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.4;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDockClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    playSound("paper");
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(6);
    }
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <style>{styles}</style>
      <header className="sh sh--l">
        <Link href="/" className="sh__mark" aria-label="Sivabalan">
          <span className="text-star" aria-hidden="true">✳︎</span>{" "}
          <span className="sh__name">
            <span className="sh__name-word">Sivabalan</span>
          </span>
        </Link>

        <div className="sh__mobile-actions">
          <span className="sh__mobile-status-chip">
            <span className="sh__mobile-status-dot" aria-hidden="true" />
            <span>available</span>
          </span>

          <a
            href={personalInfo.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sh__cv-btn"
            aria-label="CV"
            onClick={() => playSound("hover")}
          >
            <span>CV</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

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

      <nav className="sh__mobile-dock" aria-label="Quick Nav">
        <a
          href="#work"
          className={`sh__dock-item ${activeSection === "work" ? "sh__dock-item--active" : ""}`}
          onClick={(e) => handleDockClick(e, "work")}
        >
          ✳ work
        </a>
        <a
          href="#about"
          className={`sh__dock-item ${activeSection === "about" ? "sh__dock-item--active" : ""}`}
          onClick={(e) => handleDockClick(e, "about")}
        >
          about
        </a>
        <a
          href="#skills"
          className={`sh__dock-item ${activeSection === "skills" ? "sh__dock-item--active" : ""}`}
          onClick={(e) => handleDockClick(e, "skills")}
        >
          skills
        </a>
        <a
          href="#experience"
          className={`sh__dock-item ${activeSection === "experience" ? "sh__dock-item--active" : ""}`}
          onClick={(e) => handleDockClick(e, "experience")}
        >
          exp
        </a>
        <a
          href="#contact"
          className={`sh__dock-item ${activeSection === "contact" ? "sh__dock-item--active" : ""}`}
          onClick={(e) => handleDockClick(e, "contact")}
        >
          contact
        </a>
      </nav>
    </>
  );
}
