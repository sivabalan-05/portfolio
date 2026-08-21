"use client";

import { useEffect, useState } from "react";

export type MotionTier = "full" | "lite";

export const MOTION_TIER_EVENT = "portfolio:motion-tier";

export function currentMotionTier(): MotionTier {
  if (typeof document === "undefined") return "lite";
  return document.documentElement.dataset.motion === "full" ? "full" : "lite";
}

export function useRichMotion() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(currentMotionTier() === "full");
    sync();
    window.addEventListener(MOTION_TIER_EVENT, sync);
    return () => window.removeEventListener(MOTION_TIER_EVENT, sync);
  }, []);

  return enabled;
}
