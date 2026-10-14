"use client";

import { useEffect } from "react";
import type Lenis from "lenis";
import { loadMotion, prefersReducedMotion } from "@/lib/motion";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export { prefersReducedMotion };

/** Lenis smooth scroll driven by GSAP's ticker so ScrollTrigger stays in sync.
 *  Loaded lazily after first paint; skipped for reduced-motion users. */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let cancelled = false;
    let cleanup = () => {};
    // loadMotion() waits for idle, so smooth scrolling never competes with first paint.
    Promise.all([import("lenis"), loadMotion()]).then(([{ default: LenisCtor }, { gsap, ScrollTrigger }]) => {
      if (cancelled) return;
      const lenis = new LenisCtor({ lerp: 0.11, wheelMultiplier: 1, autoRaf: false });
      window.__lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      cleanup = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        delete window.__lenis;
      };
    });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);
  return null;
}

export function scrollToTop() {
  if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}

export function lockScroll(lock: boolean) {
  if (window.__lenis) {
    if (lock) window.__lenis.stop();
    else window.__lenis.start();
  }
  document.documentElement.style.overflow = lock ? "hidden" : "";
}
