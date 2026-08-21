"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRichMotion } from "@/lib/performanceTier";

const Cursor = dynamic(() => import("./Cursor"), { ssr: false });

export default function AdaptiveCursor() {
  const richMotion = useRichMotion();
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFinePointer(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return richMotion && finePointer ? <Cursor /> : null;
}
