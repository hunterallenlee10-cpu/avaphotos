"use client";

import type { gsap as GsapT } from "gsap";
import type { ScrollTrigger as ScrollTriggerT } from "gsap/ScrollTrigger";

/**
 * GSAP + ScrollTrigger are loaded lazily, after first paint, so they never sit
 * on the critical path for LCP. Every motion component awaits this.
 */
type Motion = { gsap: typeof GsapT; ScrollTrigger: typeof ScrollTriggerT };

let motionP: Promise<Motion> | null = null;
let motion: Motion | null = null;

/** Resolves at the first idle moment after load, so motion code never
 *  competes with first paint or hydration. */
const whenIdle = () =>
  new Promise<void>((resolve) => {
    const go = () =>
      "requestIdleCallback" in window
        ? window.requestIdleCallback(() => resolve(), { timeout: 2000 })
        : setTimeout(resolve, 300);
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
  });

export function loadMotion(): Promise<Motion> {
  motionP ??= whenIdle()
    .then(() => Promise.all([import("gsap"), import("gsap/ScrollTrigger")]))
    .then(([g, st]) => {
      g.gsap.registerPlugin(st.ScrollTrigger);
      motion = { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger };
      return motion;
    });
  return motionP;
}

/** Synchronous access once loaded (null before). */
export const getMotion = () => motion;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Run `setup` once GSAP is ready; returns an effect cleanup that also covers
 *  unmounting before the import resolves. */
export function withMotion(setup: (m: Motion) => (() => void) | void) {
  let cleanup: (() => void) | void;
  let cancelled = false;
  loadMotion().then((m) => {
    if (!cancelled) cleanup = setup(m);
  });
  return () => {
    cancelled = true;
    cleanup?.();
  };
}
