"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion, withMotion } from "@/lib/motion";

/** Scroll-linked drift. `amount` is the travel in % of the element's height. */
export function Parallax({
  children,
  amount = 12,
  className = "",
  desktopOnly = false,
}: {
  children: ReactNode;
  amount?: number;
  className?: string;
  /** Skip below 768px, e.g. for stacked columns that would overlap. */
  desktopOnly?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!amount || prefersReducedMotion()) return;
    if (desktopOnly && !window.matchMedia("(min-width: 768px)").matches) return;
    const el = ref.current!;
    return withMotion(({ gsap }) => {
      const tween = gsap.fromTo(
        el,
        { yPercent: -amount / 2 },
        {
          yPercent: amount / 2,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
  }, [amount, desktopOnly]);
  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
