"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
    if (!amount || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (desktopOnly && !window.matchMedia("(min-width: 768px)").matches) return;
    const el = ref.current!;
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
  }, [amount, desktopOnly]);
  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
