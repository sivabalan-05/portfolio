"use client";

import Link from "next/link";
import Image from "next/image";
import { Fragment, useState, type CSSProperties } from "react";
import { projects } from "@/data/portfolioData";
import EditorialFooter from "@/components/EditorialFooter";
import SiteHeader from "@/components/SiteHeader";

interface ProjectCardProps {
  id?: string;
  num: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  img: string;
  ratio: number;
  index: number;
  total: string;
  highlight?: string;
  metrics?: string;
}

const DIVIDER_SYMBOLS = [
  "*", ".", "+", ".", "*", ".", "+", ".", "*", ".", "+", ".", "*", ".", "+", ".", "*", ".", "+",
] as const;

function AsciiDivider({ vertical = false }: { vertical?: boolean }) {
  return (
    <span
      className={`wk-ascii-divider ${
        vertical ? "wk-ascii-divider--vertical" : "wk-ascii-divider--horizontal"
      }`}
      aria-hidden="true"
    >
      {DIVIDER_SYMBOLS.map((symbol, symbolIndex) => (
        <span
          key={`${symbol}-${symbolIndex}`}
          style={
            { "--ascii-delay": `${symbolIndex * 58}ms` } as CSSProperties
          }
        >
          {symbol}
        </span>
      ))}
    </span>
  );
}

function ProjectCard({
  id,
  num,
  title,
  category,
  tagline,
  description,
  technologies,
  githubUrl,
  liveUrl,
  img,
  ratio,
  index,
  total,
  metrics,
}: ProjectCardProps) {
  const headingId = `project-title-${num}`;

  return (
    <article
      id={id}
      className="wk-project"
      data-reverse={index % 2 === 1 ? "true" : undefined}
      aria-labelledby={headingId}
    >
      <div
        className="wk-project__visual"
        style={{ aspectRatio: `1 / ${ratio}` }}
      >
        <Image
          className="wk-project__image"
          src={img}
          alt={title}
          fill
          sizes="(max-width: 900px) calc(100vw - 2.5rem), 66vw"
          loading={index === 0 ? "eager" : "lazy"}
        />
      </div>

      <div className="wk-project__copy">
        <AsciiDivider vertical />
        <span className="wk-project__count">
          {num} / {total}
          <AsciiDivider />
        </span>
        <h2 className="wk-project__title" id={headingId}>
          {title}
        </h2>
        <p className="wk-project__tags">{category} · {technologies.join(", ")}</p>
        <p className="wk-project__desc">{description}</p>
        {metrics ? (
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.82rem",
            color: "var(--site-accent, #14736e)",
            marginBottom: "1.2rem",
            lineHeight: 1.4,
          }}>
            ✳︎ {metrics}
          </p>
        ) : null}

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
          {liveUrl ? (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="wk-project__cta hover-trigger"
            >
              <span>Live Demo</span>
              <span className="wk-project__cta-icon" aria-hidden="true">↗</span>
            </a>
          ) : null}
          {githubUrl ? (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="wk-project__cta hover-trigger"
              style={{ opacity: 0.85 }}
            >
              <span>Source Code</span>
              <span className="wk-project__cta-icon" aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

const CATEGORIES = [
  "All",
  "AI / Full Stack",
  "Distributed Systems",
  "Cloud / DevOps",
  "Creative Technology",
  "Fintech / Web App",
] as const;

export default function WorkPage() {
  const [selectedCat, setSelectedCat] = useState<string>("All");

  const filteredProjects =
    selectedCat === "All"
      ? projects
      : projects.filter((p) => p.category.includes(selectedCat));

  const localStyles = `
    .wk-page {
      background: var(--site-paper, #ede7da);
      color: var(--site-ink, #1c1b18);
      min-height: 100svh;
      padding-top: clamp(6.2rem, 12vh, 8.8rem);
    }
    .wk-main {
      padding: 0 clamp(1.25rem, 5.2vw, 5.5rem);
      max-width: 1440px;
      margin: 0 auto;
    }
    .wk-intro {
      margin-bottom: clamp(2.8rem, 6vh, 4.5rem);
    }
    .wk-intro__eyebrow {
      font-family: var(--font-mono);
      font-size: var(--type-micro);
      text-transform: uppercase;
      letter-spacing: .16em;
      opacity: .65;
      margin-bottom: .8rem;
    }
    .wk-heading {
      font-family: var(--font-body);
      font-size: clamp(2.6rem, 7vw, 5.2rem);
      font-weight: 700;
      line-height: .98;
      letter-spacing: -.03em;
      text-transform: lowercase;
    }
    .wk-heading em {
      font-family: var(--font-head);
      font-style: italic;
      font-weight: 400;
      letter-spacing: -.01em;
      margin-left: .35ch;
    }
    .wk-filters {
      display: flex;
      gap: .75rem;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 4rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px dashed color-mix(in srgb, var(--site-ink) 20%, transparent);
    }
    .wk-tab {
      font-family: var(--font-mono);
      font-size: 0.78rem;
      padding: .45rem .85rem;
      border: 1px solid color-mix(in srgb, var(--site-ink) 20%, transparent);
      border-radius: 99px;
      background: transparent;
      color: inherit;
      cursor: pointer;
      text-transform: lowercase;
      letter-spacing: .04em;
      transition: all .2s ease;
    }
    .wk-tab[data-active="true"],
    .wk-tab:hover {
      background: var(--site-ink, #1c1b18);
      color: var(--site-paper, #ede7da);
      border-color: var(--site-ink, #1c1b18);
    }
    .wk-project {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
      gap: clamp(2rem, 5vw, 4.5rem);
      align-items: center;
      margin-bottom: clamp(5rem, 10vh, 8rem);
    }
    .wk-project[data-reverse="true"] {
      grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
    }
    .wk-project[data-reverse="true"] .wk-project__visual {
      order: 2;
    }
    .wk-project[data-reverse="true"] .wk-project__copy {
      order: 1;
    }
    .wk-project__visual {
      position: relative;
      width: 100%;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--site-ink) 20%, transparent);
      box-shadow: 6px 6px 0 color-mix(in srgb, var(--site-ink) 8%, transparent);
    }
    .wk-project__image {
      object-fit: cover;
      transition: transform .6s cubic-bezier(.16,1,.3,1);
    }
    .wk-project:hover .wk-project__image {
      transform: scale(1.03);
    }
    .wk-project__copy {
      display: flex;
      flex-direction: column;
    }
    .wk-project__count {
      font-family: var(--font-mono);
      font-size: .8rem;
      letter-spacing: .1em;
      opacity: .6;
      margin-bottom: .6rem;
    }
    .wk-project__title {
      font-family: var(--font-body);
      font-size: clamp(1.6rem, 3.2vw, 2.6rem);
      font-weight: 700;
      line-height: 1.1;
      letter-spacing: -.025em;
      text-transform: lowercase;
      margin-bottom: .8rem;
    }
    .wk-project__tags {
      font-family: var(--font-mono);
      font-size: .78rem;
      letter-spacing: .04em;
      opacity: .75;
      margin-bottom: 1.2rem;
    }
    .wk-project__desc {
      font-family: var(--font-body);
      font-size: 1rem;
      line-height: 1.6;
      opacity: .88;
      margin-bottom: 1.2rem;
    }
    .wk-project__cta {
      display: inline-flex;
      align-items: center;
      gap: .4rem;
      font-family: var(--font-mono);
      font-size: .82rem;
      letter-spacing: .06em;
      text-transform: lowercase;
      text-decoration: none;
      color: inherit;
      padding: .45rem .85rem;
      border: 1px solid currentColor;
      border-radius: 99px;
      transition: background .2s ease, color .2s ease;
    }
    .wk-project__cta:hover {
      background: var(--site-ink, #1c1b18);
      color: var(--site-paper, #ede7da);
    }
    .wk-ascii-divider {
      font-family: var(--font-mono);
      font-size: .65rem;
      opacity: .35;
      letter-spacing: .15em;
    }
    @media (max-width: 860px) {
      .wk-project, .wk-project[data-reverse="true"] {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      .wk-project[data-reverse="true"] .wk-project__visual { order: 0; }
      .wk-project[data-reverse="true"] .wk-project__copy { order: 0; }
    }
  `;

  return (
    <div className="wk-page">
      <style>{localStyles}</style>
      <SiteHeader />

      <main className="wk-main">
        <header className="wk-intro">
          <p className="wk-intro__eyebrow">
            portfolio · 2026
          </p>
          <h1 className="wk-heading">
            <span>selected</span>
            <em>projects</em>
          </h1>
        </header>

        <nav className="wk-filters" aria-label="Project domain filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className="wk-tab hover-trigger"
              data-active={selectedCat === cat ? "true" : undefined}
              onClick={() => setSelectedCat(cat)}
            >
              <span>{cat}</span>
              <span style={{ marginLeft: ".4rem", opacity: 0.7 }}>
                (
                {cat === "All"
                  ? projects.length
                  : projects.filter((p) => p.category.includes(cat)).length}
                )
              </span>
            </button>
          ))}
        </nav>

        <section aria-label="Projects list">
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              num={project.num}
              title={project.title}
              category={project.category}
              tagline={project.tagline}
              description={project.description}
              technologies={project.technologies}
              githubUrl={project.githubUrl}
              liveUrl={project.liveUrl}
              img={project.img}
              ratio={project.ratio}
              index={index}
              total={String(filteredProjects.length).padStart(2, "0")}
              highlight={project.highlight}
              metrics={project.metrics}
            />
          ))}
        </section>
      </main>

      <div id="contact">
        <EditorialFooter />
      </div>
    </div>
  );
}
