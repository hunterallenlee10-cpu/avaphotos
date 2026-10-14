"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import type { Sport } from "@/lib/photos";
import { pad } from "@/lib/format";

type Item = Pick<Sport, "slug" | "name" | "blurb" | "cover" | "accent"> & { count: number; previews: Sport["photos"] };

/**
 * Desktop: a towering list of sport names; hovering one floats a preview
 * that trails the cursor and flicks through that sport's frames.
 * Mobile: each sport is a tappable card.
 */
export function WorkIndex({ items }: { items: Item[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [frame, setFrame] = useState(0);
  const preview = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0, cx: 0, cy: 0 });
  const enter = (i: number) => {
    setHover(i);
    setFrame(0);
  };

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const move = (e: PointerEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
    };
    const loop = () => {
      const p = pos.current;
      const k = reduced ? 1 : 0.12;
      const dx = p.x - p.cx;
      p.cx += dx * k;
      p.cy += (p.y - p.cy) * k;
      if (preview.current) {
        const tilt = reduced ? 0 : Math.max(-8, Math.min(8, dx * 0.04));
        preview.current.style.transform = `translate3d(${p.cx}px, ${p.cy}px, 0) translate(-50%, -50%) rotate(${tilt}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  // flick through a few frames of the hovered sport
  useEffect(() => {
    if (hover === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setFrame((f) => f + 1), 900);
    return () => clearInterval(id);
  }, [hover]);

  return (
    <>
      {/* Desktop list */}
      <ul className="relative z-10 hidden border-t border-line md:block" onPointerLeave={() => setHover(null)}>
        {items.map((s, i) => (
          <li key={s.slug} className="border-b border-line">
            <Link
              href={`/work/${s.slug}`}
              data-cursor="view"
              onPointerEnter={() => enter(i)}
              onFocus={() => enter(i)}
              onBlur={() => setHover(null)}
              className={`group grid grid-cols-12 items-center gap-6 py-4 transition-opacity duration-500 ${
                hover !== null && hover !== i ? "opacity-30" : "opacity-100"
              }`}
              style={{ "--accent": s.accent } as React.CSSProperties}
            >
              <span className="scoreboard tabular col-span-1 text-3xl">{pad(i + 1)}</span>
              <span className="display col-span-8 text-[clamp(4rem,10.5vw,11rem)] leading-[0.86] transition-transform duration-700 ease-out-expo group-hover:translate-x-4">
                {s.name}
              </span>
              <span className="col-span-3 flex items-baseline justify-end gap-2 text-right">
                <span className="display tabular text-4xl">{pad(s.count)}</span>
                <span className="label text-mute">Frames</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div
        ref={preview}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-0 hidden aspect-[4/5] w-[22vw] max-w-[340px] md:block"
      >
        {items.map((s, i) => {
          const p = s.previews[frame % s.previews.length];
          return (
            <div
              key={s.slug}
              className="absolute inset-0 transition-[clip-path,opacity] duration-700 ease-out-expo"
              style={{
                clipPath: hover === i ? "inset(0% 0% 0% 0%)" : "inset(50% 50% 50% 50%)",
                opacity: hover === i ? 1 : 0,
              }}
            >
              <div className="relative h-full w-full">
                {s.previews.map((pp) => (
                  <div key={pp.id} className="absolute inset-0" style={{ opacity: pp.id === p.id ? 1 : 0 }}>
                    <Photo photo={pp} fill sizes="340px" alt="" ariaHidden />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile cards */}
      <ul className="grid gap-4 md:hidden">
        {items.map((s, i) => (
          <li key={s.slug}>
            <Link href={`/work/${s.slug}`} className="group relative block aspect-[4/5] overflow-hidden" style={{ "--accent": s.accent } as React.CSSProperties}>
              <Photo photo={s.cover} fill sizes="100vw" alt="" ariaHidden eager={i === 0} />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(10_11_10/0.88),transparent_55%)]" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4">
                <div>
                  <span className="scoreboard tabular text-xl">{pad(i + 1)}</span>
                  <span className="display mt-1 block text-[16vw] leading-[0.85]">{s.name}</span>
                </div>
                <span className="label shrink-0 pb-1 text-paper/80">{pad(s.count)} frames →</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
