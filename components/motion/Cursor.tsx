"use client";

import { useEffect, useRef } from "react";

/**
 * Viewfinder cursor: four crop marks around a dot. Grows and reads "VIEW"
 * over anything marked data-cursor="view"; tightens over links and buttons.
 * Only mounts behaviour for fine pointers — touch devices keep native input.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");

    let x = -100, y = -100, cx = -100, cy = -100, raf = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      el.removeAttribute("data-hidden");
      const target = e.target as Element | null;
      const hit = target?.closest?.("[data-cursor], a, button, [role='button'], input, textarea, select, label");
      let state = "";
      if (hit) {
        const explicit = hit.getAttribute("data-cursor");
        if (explicit) state = explicit;
        else if (hit.matches("input, textarea, select")) state = "hide";
        else state = "link";
      }
      if (state === "hide") el.setAttribute("data-hidden", "");
      el.dataset.state = state === "hide" ? "" : state;
    };
    const leave = () => el.setAttribute("data-hidden", "");
    const loop = () => {
      const k = reduced ? 1 : 0.22;
      cx += (x - cx) * k;
      cy += (y - cy) * k;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div ref={ref} className="cursor hidden [@media(hover:hover)_and_(pointer:fine)]:grid" data-hidden="" aria-hidden="true">
      <span className="crop-marks" />
      <span className="cursor-dot" />
      <span className="cursor-label">VIEW</span>
    </div>
  );
}
