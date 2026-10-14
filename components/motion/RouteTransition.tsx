"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NAV, SPORTS } from "@/content/site";
import { prefersReducedMotion, scrollToTop } from "./SmoothScroll";

function labelFor(pathname: string) {
  if (pathname === "/") return { n: "00", label: "Home" };
  const sport = SPORTS.find((s) => pathname === `/work/${s.slug}`);
  if (sport) return { n: String(SPORTS.indexOf(sport) + 1).padStart(2, "0"), label: sport.name };
  const nav = NAV.find((n) => pathname.startsWith(n.href));
  return nav ? { n: nav.n, label: nav.label } : { n: "--", label: "" };
}

/**
 * Page transitions: an amber curtain wipes up over the page, the route
 * changes underneath, then the curtain wipes off the top. Intercepts internal
 * link clicks in the capture phase (Next's <Link> respects defaultPrevented).
 * Browser back/forward navigate natively with no curtain.
 */
export function RouteTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const curtain = useRef<HTMLDivElement>(null);
  const pending = useRef<string | null>(null);
  const busy = useRef(false);
  const [label, setLabel] = useState(labelFor(pathname));

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      if (a.hasAttribute("data-no-transition")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) {
        if (url.hash) return; // in-page anchor
        e.preventDefault();
        return;
      }
      e.preventDefault();
      if (busy.current) return;
      busy.current = true;
      const href = url.pathname + url.search + url.hash;
      setLabel(labelFor(url.pathname));
      router.prefetch(url.pathname);

      const el = curtain.current!;
      if (prefersReducedMotion()) {
        gsap.set(el, { clipPath: "inset(0% 0 0% 0)", opacity: 0 });
        gsap.to(el, {
          opacity: 1,
          duration: 0.2,
          onComplete: () => {
            pending.current = url.pathname;
            router.push(href, { scroll: false });
          },
        });
        return;
      }
      gsap.fromTo(
        el,
        { clipPath: "inset(100% 0% 0% 0%)", opacity: 1 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.6,
          ease: "expo.inOut",
          onComplete: () => {
            pending.current = url.pathname;
            router.push(href, { scroll: false });
          },
        },
      );
      gsap.fromTo(el.querySelectorAll("[data-curtain-label]"), { yPercent: 110 }, { yPercent: 0, duration: 0.7, delay: 0.2, ease: "expo.out" });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  useEffect(() => {
    if (!pending.current || pending.current !== pathname) return;
    pending.current = null;
    const el = curtain.current!;
    scrollToTop();
    // Let the new page lay out before ScrollTrigger measures it.
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (prefersReducedMotion()) {
        gsap.to(el, {
          opacity: 0,
          duration: 0.25,
          onComplete: () => {
            gsap.set(el, { clipPath: "inset(100% 0 0 0)", opacity: 1 });
            busy.current = false;
          },
        });
        return;
      }
      gsap.to(el, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.75,
        delay: 0.12,
        ease: "expo.inOut",
        onComplete: () => {
          gsap.set(el, { clipPath: "inset(100% 0% 0% 0%)" });
          busy.current = false;
        },
      });
    });
  }, [pathname]);

  return (
    <div ref={curtain} className="curtain" aria-hidden="true">
      <div className="flex w-full items-end justify-between gap-6 overflow-hidden">
        <div data-curtain-label className="display text-[clamp(4.5rem,17vw,16rem)]">
          {label.label}
        </div>
        <div data-curtain-label className="display tabular pb-[0.4em] text-[clamp(2rem,5vw,4.5rem)]">
          {label.n}
        </div>
      </div>
    </div>
  );
}
