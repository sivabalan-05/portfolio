"use client";
import { projects } from "@/data/portfolioData";
import type { IndexItem } from "./EditorialIndex";

/** Centralized projects list for landing page and work showcase. */
export function useProjects(): IndexItem[] {
  return projects.map((p) => ({
    id: p.id,
    num: p.num,
    title: p.title,
    tags: `${p.category} / ${p.technologies.slice(0, 3).join(", ")}`,
    href: `/work#${p.id}`,
    impact: p.metrics || p.highlight || p.tagline,
    ratio: p.ratio,
    img: p.img,
    githubUrl: p.githubUrl,
    liveUrl: p.liveUrl,
    description: p.description,
    technologies: p.technologies,
    tagline: p.tagline,
  }));
}
