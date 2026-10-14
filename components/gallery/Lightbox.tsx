"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { lockScroll } from "@/components/motion/SmoothScroll";
import type { Photo as PhotoT } from "@/lib/photos";
import { pad } from "@/lib/format";

type Props = {
  photos: PhotoT[];
  index: number | null;
  sportName: string;
  onClose: () => void;
  onIndex: (i: number) => void;
};

const MAX_ZOOM = 4;

/**
 * Full-screen viewer on a native <dialog> (top layer, inert background, Esc).
 * ← / → / Home / End to move, Esc to close, swipe on touch, pinch or
 * double-tap / double-click to zoom, drag to pan while zoomed.
 */
export function Lightbox({ photos, index, sportName, onClose, onIndex }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const open = index !== null;
  const i = index ?? 0;
  const photo = photos[i];

  const [zoom, setZoom] = useState({ s: 1, x: 0, y: 0 });
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ startDist: number; startScale: number; startX: number; startY: number; ox: number; oy: number; moved: boolean; t: number } | null>(null);
  const lastTap = useRef(0);

  const go = useCallback(
    (d: number) => {
      onIndex((i + d + photos.length) % photos.length);
    },
    [i, onIndex, photos.length],
  );

  // open / close the native dialog
  useEffect(() => {
    const d = dialog.current!;
    if (open && !d.open) {
      d.showModal();
      lockScroll(true);
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  useEffect(() => {
    const d = dialog.current!;
    const onClose_ = () => {
      lockScroll(false);
      onClose();
    };
    d.addEventListener("close", onClose_);
    return () => d.removeEventListener("close", onClose_);
  }, [onClose]);

  // reset zoom when the frame changes
  const [prevI, setPrevI] = useState(i);
  if (prevI !== i) {
    setPrevI(i);
    setZoom({ s: 1, x: 0, y: 0 });
    setDragX(0);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Home") onIndex(0);
      else if (e.key === "End") onIndex(photos.length - 1);
      else if (e.key === "+" || e.key === "=") setZoom((z) => ({ ...z, s: Math.min(MAX_ZOOM, z.s * 1.5) }));
      else if (e.key === "-") setZoom((z) => (z.s / 1.5 <= 1 ? { s: 1, x: 0, y: 0 } : { ...z, s: z.s / 1.5 }));
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go, onIndex, photos.length]);

  const clampPan = (s: number, x: number, y: number) => {
    const r = stage.current?.getBoundingClientRect();
    if (!r) return { s, x, y };
    const mx = ((s - 1) * r.width) / 2;
    const my = ((s - 1) * r.height) / 2;
    return { s, x: Math.max(-mx, Math.min(mx, x)), y: Math.max(-my, Math.min(my, y)) };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    gesture.current = {
      startDist: pts.length === 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0,
      startScale: zoom.s,
      startX: e.clientX,
      startY: e.clientY,
      ox: zoom.x,
      oy: zoom.y,
      moved: false,
      t: Date.now(),
    };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const pts = [...pointers.current.values()];
    if (pts.length === 2 && g.startDist) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const s = Math.max(1, Math.min(MAX_ZOOM, (g.startScale * dist) / g.startDist));
      setZoom((z) => clampPan(s, z.x, z.y));
      g.moved = true;
      return;
    }
    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) g.moved = true;
    if (zoom.s > 1) setZoom(clampPan(zoom.s, g.ox + dx, g.oy + dy));
    else if (e.pointerType !== "mouse") setDragX(dx);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    if (!g) return;
    if (pointers.current.size > 0) return; // still pinching
    gesture.current = null;
    setDragging(false);
    if (zoom.s === 1 && Math.abs(dragX) > 60) {
      go(dragX < 0 ? 1 : -1);
      return;
    }
    setDragX(0);
    if (!g.moved && Date.now() - g.t < 300) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        // double tap / click: toggle zoom around the tap point
        const r = stage.current!.getBoundingClientRect();
        if (zoom.s > 1) setZoom({ s: 1, x: 0, y: 0 });
        else {
          const s = 2.5;
          setZoom(clampPan(s, (r.width / 2 - (e.clientX - r.left)) * (s - 1), (r.height / 2 - (e.clientY - r.top)) * (s - 1)));
        }
        lastTap.current = 0;
      } else lastTap.current = now;
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey) return; // trackpad pinch arrives as ctrl+wheel
    const s = Math.max(1, Math.min(MAX_ZOOM, zoom.s * (1 - e.deltaY * 0.01)));
    setZoom(s === 1 ? { s: 1, x: 0, y: 0 } : clampPan(s, zoom.x, zoom.y));
  };

  const next = photos[(i + 1) % photos.length];
  const prev = photos[(i - 1 + photos.length) % photos.length];

  return (
    <dialog
      ref={dialog}
      aria-label={`${sportName} gallery viewer`}
      className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-ink p-0 text-paper backdrop:bg-ink/95"
      onCancel={(e) => {
        // Esc while zoomed resets zoom first
        if (zoom.s > 1) {
          e.preventDefault();
          setZoom({ s: 1, x: 0, y: 0 });
        }
      }}
    >
      {open && photo && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 px-(--gutter) py-3 md:py-4">
            <p className="flex items-baseline gap-3" aria-live="polite">
              <span className="scoreboard scoreboard-dots tabular text-[2.4rem] md:text-[3rem]">{pad(i + 1)}</span>
              <span className="label text-mute">/ {pad(photos.length)}</span>
              <span className="sr-only">
                Photo {i + 1} of {photos.length}: {photo.alt}
              </span>
            </p>
            <button
              type="button"
              autoFocus
              onClick={() => dialog.current?.close()}
              className="label flex min-h-11 items-center gap-2 px-2"
            >
              Close <span aria-hidden="true" className="text-lg leading-none">×</span>
            </button>
          </div>

          <div
            ref={stage}
            className="relative min-h-0 flex-1 touch-none select-none overflow-hidden"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
            data-cursor={zoom.s > 1 ? "link" : undefined}
          >
            <div
              key={photo.id}
              className="lightbox-frame absolute inset-0 px-(--gutter) md:px-24"
              style={{
                transform: `translate3d(${zoom.x + dragX}px, ${zoom.y}px, 0) scale(${zoom.s})`,
                transition: dragging ? "none" : "transform 0.45s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <div className="relative h-full w-full">
                <Photo
                  photo={photo}
                  fill
                  sizes="100vw"
                  className="!bg-none"
                  style={{ backgroundColor: "transparent", backgroundImage: "none" }}
                  imgClassName="!object-contain"
                />
              </div>
            </div>
            {/* warm the cache for neighbours */}
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-0" aria-hidden="true">
              <Photo photo={next} fill sizes="100vw" alt="" ariaHidden />
              <Photo photo={prev} fill sizes="100vw" alt="" ariaHidden />
            </div>

            <button
              type="button"
              onClick={() => go(-1)}
              className="group absolute inset-y-0 left-0 hidden w-24 items-center justify-center md:flex"
              aria-label="Previous photo"
            >
              <span aria-hidden="true" className="text-2xl transition-transform duration-300 group-hover:-translate-x-1">←</span>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="group absolute inset-y-0 right-0 hidden w-24 items-center justify-center md:flex"
              aria-label="Next photo"
            >
              <span aria-hidden="true" className="text-2xl transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 px-(--gutter) py-4 text-sm">
            <p className="min-w-0">
              <span className="smallcaps text-paper">{sportName}</span>
              <span className="text-mute"> · {photo.caption}</span>
            </p>
            <div className="flex shrink-0 items-center gap-1 md:hidden">
              <button type="button" onClick={() => go(-1)} className="min-h-11 min-w-11 text-xl" aria-label="Previous photo">←</button>
              <button type="button" onClick={() => go(1)} className="min-h-11 min-w-11 text-xl" aria-label="Next photo">→</button>
            </div>
            <p className="label hidden text-mute md:block">
              {zoom.s > 1 ? "Drag to pan · double-click to reset" : "← → to browse · double-click to zoom"}
            </p>
          </div>
        </div>
      )}
      <style>{`.lightbox-frame{animation:lb-in .6s cubic-bezier(.16,1,.3,1)}@keyframes lb-in{from{opacity:0;filter:blur(6px)}to{opacity:1;filter:none}}`}</style>
    </dialog>
  );
}
