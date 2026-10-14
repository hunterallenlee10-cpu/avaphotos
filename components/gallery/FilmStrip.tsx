"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { ScrollTrigger } from "gsap/ScrollTrigger";
import { Photo } from "@/components/Photo";
import { withMotion } from "@/lib/motion";
import { Lightbox } from "./Lightbox";
import type { Photo as PhotoT } from "@/lib/photos";
import { pad } from "@/lib/format";

/**
 * Desktop: a pinned horizontal film strip — vertical scroll drives the strip
 * sideways, frames keep their real aspect ratios.
 * Mobile / reduced motion: an editorial vertical stack (mobile) or a native
 * horizontally-scrollable strip (desktop + reduced motion).
 */
export function FilmStrip({ photos, sportName, intro }: { photos: PhotoT[]; sportName: string; intro: ReactNode }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(
    () =>
      withMotion(({ gsap, ScrollTrigger }) => {
        const mm = gsap.matchMedia();
        mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
          const el = track.current!;
          const items = [...el.querySelectorAll<HTMLElement>("[data-frame]")];
          const distance = () => Math.max(0, el.scrollWidth - window.innerWidth);
          const tween = gsap.to(el, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: section.current,
              start: "top top",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 0.7,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                setProgress(self.progress);
                // the frame whose centre is closest to the viewport centre
                const mid = window.innerWidth / 2;
                let best = 0,
                  bestD = Infinity;
                items.forEach((it, idx) => {
                  const r = it.getBoundingClientRect();
                  const d = Math.abs(r.left + r.width / 2 - mid);
                  if (d < bestD) {
                    bestD = d;
                    best = idx;
                  }
                });
                setCurrent(best);
              },
            },
          });
          trigger.current = tween.scrollTrigger ?? null;
          // images change the track width as they lay out
          const ro = new ResizeObserver(() => ScrollTrigger.refresh());
          ro.observe(el);
          return () => {
            ro.disconnect();
            trigger.current = null;
          };
        });
        return () => mm.revert();
      }),
    [],
  );

  /** Keep keyboard focus visible: scroll the pinned strip to the focused frame. */
  const onFocusFrame = useCallback((idx: number, target: HTMLElement) => {
    const st = trigger.current;
    if (!st) return;
    const el = track.current!;
    const distance = el.scrollWidth - window.innerWidth;
    const frameLeft = target.offsetLeft - window.innerWidth / 2 + target.offsetWidth / 2;
    const p = Math.max(0, Math.min(1, frameLeft / distance));
    const y = st.start + (st.end - st.start) * p;
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  }, []);

  const open = (idx: number, el: HTMLElement) => {
    opener.current = el;
    setLightbox(idx);
  };
  const close = useCallback(() => {
    setLightbox(null);
    opener.current?.focus({ preventScroll: true });
  }, []);

  return (
    <>
      {/* ── Desktop strip ───────────────────────────────── */}
      <section
        ref={section}
        aria-label={`${sportName} photographs`}
        className="relative hidden h-[100svh] flex-col justify-center overflow-hidden pt-10 md:flex motion-reduce:h-auto motion-reduce:pb-16 motion-reduce:pt-32"
      >
        <div
          ref={track}
          className="flex items-end gap-[3vw] px-(--gutter) will-change-transform motion-reduce:overflow-x-auto motion-reduce:pb-6"
        >
          <div className="flex h-[64vh] w-[38vw] shrink-0 flex-col justify-end pb-9">{intro}</div>
          {photos.map((p, i) => (
            <figure key={p.id} className="shrink-0" data-frame>
              <button
                type="button"
                data-cursor="view"
                onClick={(e) => open(i, e.currentTarget)}
                onFocus={(e) => onFocusFrame(i, e.currentTarget.parentElement as HTMLElement)}
                className="group block h-[64vh] overflow-hidden"
                style={{ aspectRatio: `${p.width} / ${p.height}` }}
                aria-label={`Open photo ${i + 1} of ${photos.length}: ${p.alt}`}
              >
                <Photo
                  photo={p}
                  sizes={`${Math.round((64 * p.width) / p.height)}vh`}
                  className="h-full"
                  imgClassName="transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.03]"
                />
              </button>
              <figcaption className="mt-3 flex items-baseline justify-between gap-4 text-xs">
                <span className="smallcaps text-paper/90">{p.caption}</span>
                <span className="tabular text-mute">
                  {pad(i + 1)} / {pad(photos.length)}
                </span>
              </figcaption>
            </figure>
          ))}
          <div className="w-[10vw] shrink-0" aria-hidden="true" />
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-6 flex items-center gap-6 px-(--gutter) motion-reduce:hidden"
          aria-hidden="true"
        >
          <span className="scoreboard scoreboard-dots tabular text-[2.6rem]">{pad(current + 1)}</span>
          <span className="label text-mute">/ {pad(photos.length)}</span>
          <div className="h-px flex-1 bg-line">
            <div className="h-px origin-left bg-accent" style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>
      </section>

      {/* ── Mobile stack ───────────────────────────────── */}
      <section aria-label={`${sportName} photographs`} className="px-(--gutter) pb-20 md:hidden">
        <ul className="flex flex-col gap-12">
          {photos.map((p, i) => {
            const landscape = p.width > p.height;
            const narrow = !landscape && i % 3 === 1;
            const right = i % 2 === 1;
            return (
              <li key={p.id} className={`fade-up ${narrow ? `w-[78%] ${right ? "ml-auto" : ""}` : ""}`}>
                <figure>
                  <button
                    type="button"
                    onClick={(e) => open(i, e.currentTarget)}
                    className="block w-full"
                    aria-label={`Open photo ${i + 1} of ${photos.length}: ${p.alt}`}
                  >
                    <Photo photo={p} sizes={narrow ? "78vw" : "100vw"} eager={i === 0} />
                  </button>
                  <figcaption className="mt-3 flex items-baseline justify-between gap-4 text-xs">
                    <span className="smallcaps text-paper/90">{p.caption}</span>
                    <span className="tabular text-mute">
                      {pad(i + 1)} / {pad(photos.length)}
                    </span>
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </section>

      <Lightbox photos={photos} index={lightbox} sportName={sportName} onClose={close} onIndex={setLightbox} />
    </>
  );
}
