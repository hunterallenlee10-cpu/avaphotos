"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Photo } from "@/components/Photo";
import type { Photo as PhotoT } from "@/lib/photos";
import { BRAND, HOME } from "@/content/site";
import { pad } from "@/lib/photos";

const HOLD = 5200; // ms each frame is on screen

/**
 * Full-bleed reel. Only the first frame is rendered (and preloaded) on the
 * server; the rest mount after hydration and start loading once the first has
 * painted, so they never compete with LCP.
 */
export function Hero({ frames }: { frames: (PhotoT & { href: string; sportName: string })[] }) {
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(1);
  const [paused, setPaused] = useState(false);
  const [entered, setEntered] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setMounted(frames.length), 1200);
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [frames.length]);

  useEffect(() => {
    if (paused || mounted < frames.length) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % frames.length), HOLD);
    return () => clearTimeout(id);
  }, [active, paused, mounted, frames.length]);

  // Pause when the tab is hidden or the hero is off-screen.
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current!;
    let visible = true;
    const sync = () => setPaused(!visible || document.hidden);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const current = frames[active];

  return (
    <section
      ref={ref}
      aria-label="Introduction"
      className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-ink"
    >
      <div className="absolute inset-0">
        {frames.slice(0, mounted).map((f, i) => (
          <div
            key={f.id}
            className="absolute inset-0 transition-opacity duration-[1600ms] ease-in-out"
            style={{ opacity: i === active ? 1 : 0, zIndex: i === active ? 2 : 1 }}
            aria-hidden={i !== active}
          >
            <div
              className="absolute inset-0 will-change-transform"
              style={{
                transform: i === active && entered ? "scale(1)" : "scale(1.08)",
                transition: i === active ? `transform ${HOLD + 1600}ms linear` : "transform 0s 1.6s",
              }}
            >
              <Photo photo={f} fill priority={i === 0} sizes="100vw" alt={i === 0 ? f.alt : ""} />
            </div>
          </div>
        ))}
        {/* Legibility: deep floor + soft top vignette, kept off the athletes' faces. */}
        <div className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(to_top,rgb(10_11_10/0.92)_0%,rgb(10_11_10/0.55)_28%,transparent_58%),linear-gradient(to_bottom,rgb(10_11_10/0.55),transparent_22%)]" />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 px-(--gutter) pb-6 md:pb-10">
        <div className="mb-5 flex items-end justify-between gap-6 md:mb-8">
          <p className={`label text-paper/80 transition-opacity delay-700 duration-1000 ${entered ? "opacity-100" : "opacity-0"}`}>
            {HOME.heroKicker}
          </p>
          <div className="hidden text-right md:block">
            <Link
              href={current.href}
              className="smallcaps text-sm text-paper/80 hover:text-paper"
              data-cursor="link"
            >
              {current.sportName} · {current.caption}
            </Link>
          </div>
        </div>

        <h1 className={`reveal-up display text-[30vw] md:text-[clamp(5.2rem,24.5vw,26rem)] leading-[0.78] ${entered ? "is-in" : ""}`}>
          <span className="mask-line"><span>{BRAND.firstName}</span></span>
          <span className="mask-line"><span>{BRAND.lastName}</span></span>
          <span className="sr-only"> — {HOME.heroKicker}</span>
        </h1>

        <div className="mt-5 flex flex-col gap-5 md:mt-6 md:flex-row md:items-end md:justify-between">
          <p
            className={`serif max-w-[26ch] text-[clamp(1.45rem,2.6vw,2.4rem)] leading-[1.05] transition-[opacity,transform] delay-500 duration-1000 ease-out-expo ${
              entered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            {HOME.heroLine}
          </p>
          <div className="flex items-center gap-4">
            <span className="scoreboard scoreboard-dots tabular text-[2.6rem] md:text-[3.4rem]" aria-label={`Frame ${active + 1} of ${frames.length}`}>
              {pad(active + 1)}
            </span>
            <span className="label text-mute">/ {pad(frames.length)}</span>
            <div className="hidden h-px w-28 bg-line md:block" aria-hidden="true">
              <div
                key={`${active}-${paused}`}
                className="h-px origin-left bg-amber"
                style={{
                  animation: paused || mounted < frames.length ? "none" : `hero-progress ${HOLD}ms linear forwards`,
                  transform: "scaleX(0)",
                }}
              />
            </div>
            <button
              type="button"
              className="label min-h-11 px-2 text-mute hover:text-paper"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
            >
              {paused ? "Play" : "Pause"}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes hero-progress{to{transform:scaleX(1)}}`}</style>
    </section>
  );
}
