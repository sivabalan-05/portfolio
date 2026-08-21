"use client";
import { useEffect } from "react";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const shouldUseNativeScroll = window.matchMedia(
      "(pointer: coarse), (hover: none), (prefers-reduced-motion: reduce)",
    ).matches;
    if (shouldUseNativeScroll) return;

    let cancelled = false;
    let frame = 0;
    let destroy: () => void = () => {};

    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
      });

      const raf = (time: number) => {
        lenis.raf(time);
        frame = requestAnimationFrame(raf);
      };

      destroy = () => lenis.destroy();
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      destroy();
    };
  }, []);

  return <>{children}</>;
}
