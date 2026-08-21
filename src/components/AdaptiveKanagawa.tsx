"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRichMotion } from "@/lib/performanceTier";
import StaticKanagawa from "./StaticKanagawa";

const InteractiveKanagawa = dynamic(() => import("./AsciiKanagawa"), {
  ssr: false,
});

export default function AdaptiveKanagawa({
  className,
  opacity = .3,
}: {
  className?: string;
  opacity?: number;
}) {
  const richMotion = useRichMotion();
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (min-width: 861px)",
    );
    const sync = () => setFinePointer(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const interactive = richMotion && finePointer;

  if (interactive) {
    return <InteractiveKanagawa className={className} opacity={opacity} />;
  }

  return <StaticKanagawa className={className} opacity={opacity} />;
}
