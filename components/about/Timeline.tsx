"use client";

import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { Txt } from "@/components/ui";
import type { Photo as PhotoT } from "@/lib/photos";
import { pad } from "@/lib/format";
import { withMotion } from "@/lib/motion";

export type Stop = {
  when: string;
  title: string;
  body: string;
  photo: PhotoT | null;
  placeholder: string;
};

/**
 * 2021 → now. A sticky scoreboard on the left flips to the active stop while
 * a progress rule fills; each stop's photo wipes in from the side as it
 * arrives. Reduced motion: no scrubbing, simple fades via .fade-up.
 */
export function Timeline({ stops }: { stops: Stop[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = root.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return withMotion(({ gsap, ScrollTrigger }) => {
      const ctx = gsap.context(() => {
        const items = gsap.utils.toArray<HTMLElement>("[data-stop]");
        items.forEach((item, i) => {
          ScrollTrigger.create({
            trigger: item,
            start: "top 55%",
            end: "bottom 55%",
            onToggle: (self) => {
              if (self.isActive) setActive(i);
              else if (i === 0 && self.direction < 0) setActive(0);
            },
          });
          if (reduced) return;
          const media = item.querySelector("[data-stop-media]");
          const inner = item.querySelector("[data-stop-media-inner]");
          if (media && inner) {
            gsap.fromTo(
              media,
              { clipPath: i % 2 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                ease: "expo.out",
                duration: 1.6,
                scrollTrigger: { trigger: item, start: "top 75%", once: true },
              },
            );
            gsap.fromTo(
              inner,
              { scale: 1.25 },
              {
                scale: 1,
                ease: "expo.out",
                duration: 2,
                scrollTrigger: { trigger: item, start: "top 75%", once: true },
              },
            );
          }
        });
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onUpdate: (self) => setProgress(self.progress),
        });
      }, el);
      return () => ctx.revert();
    });
  }, []);

  return (
    <div ref={root} className="relative grid gap-12 md:grid-cols-12">
      {/* Sticky scoreboard */}
      <div className="hidden md:col-span-4 md:block">
        <div className="sticky top-28" aria-hidden="true">
          <p className="label text-mute">
            Stop {pad(active + 1)} / {pad(stops.length)}
          </p>
          <div className="relative mt-4 h-[clamp(4rem,6.6vw,7rem)] overflow-hidden">
            {stops.map((s, i) => (
              <span
                key={s.when}
                className="scoreboard scoreboard-dots absolute left-0 top-0 whitespace-nowrap text-[clamp(4rem,6.6vw,7rem)] uppercase transition-[transform,opacity] duration-700 ease-out-expo"
                style={{
                  transform: `translateY(${(i - active) * 100}%)`,
                  opacity: i === active ? 1 : 0,
                }}
              >
                {s.when}
              </span>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-3">
            <span className="label tabular text-mute">2021</span>
            <div className="h-px flex-1 bg-line">
              <div className="h-px origin-left bg-amber" style={{ transform: `scaleX(${progress})` }} />
            </div>
            <span className="label text-mute">Now</span>
          </div>
        </div>
      </div>

      {/* Stops */}
      <ol className="space-y-24 md:col-span-8 md:space-y-40">
        {stops.map((s, i) => (
          <li key={s.when} data-stop className="grid gap-6 md:grid-cols-8 md:gap-8">
            <div className={`md:col-span-3 ${i % 2 ? "md:order-2 md:pt-24" : ""}`}>
              <p className="scoreboard tabular text-3xl uppercase md:hidden">{s.when}</p>
              <p className="label mt-2 text-mute md:mt-0">
                Stop {pad(i + 1)}
                <span className="hidden md:inline"> · {s.when}</span>
              </p>
              <h3 className="display mt-3 text-[clamp(2.6rem,4.4vw,4.4rem)]">{s.title}</h3>
              <p className="mt-4 text-paper/85">{s.body}</p>
            </div>
            <div className={`md:col-span-5 ${i % 2 ? "md:order-1" : ""}`}>
              <div data-stop-media className="relative overflow-hidden">
                {s.photo ? (
                  <figure>
                    <div data-stop-media-inner>
                      <Photo photo={s.photo} sizes="(min-width: 768px) 38vw, 92vw" />
                    </div>
                  </figure>
                ) : (
                  <div className="crop-marks grid aspect-[4/5] place-items-center bg-ink-2 p-8 text-center [--c:22px]">
                    <p className="text-sm leading-relaxed text-mute">
                      <Txt>{s.placeholder}</Txt>
                    </p>
                  </div>
                )}
              </div>
              {s.photo && <p className="smallcaps mt-3 text-xs text-mute">{s.photo.caption}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
