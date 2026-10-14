"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BRAND, NAV } from "@/content/site";
import { lockScroll } from "./motion/SmoothScroll";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close the menu on navigation.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    lockScroll(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Tuck the header away on scroll down, bring it back on scroll up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 160 && y > last + 4 ? true : y < last - 4 ? false : (h) => h);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 text-paper mix-blend-difference transition-transform duration-700 ease-out-expo ${
          hidden && !open ? "-translate-y-full" : ""
        }`}
      >
        <div className="flex items-center justify-between px-(--gutter) py-4 md:py-5">
          <Link href="/" className="group flex items-baseline gap-2" aria-label={`${BRAND.person} — home`}>
            <span className="display text-[1.6rem] leading-none tracking-[0.01em] md:text-[1.9rem]">
              {BRAND.firstName}&nbsp;{BRAND.lastName}
            </span>
          </Link>
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-9">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="group label flex items-baseline gap-1.5"
                  >
                    <span className="tabular text-[0.625rem] opacity-60">{item.n}</span>
                    <span className={`u-link ${isActive(item.href) ? "!bg-[length:100%_1px]" : ""}`}>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <button
            ref={buttonRef}
            type="button"
            className="label -mr-3 flex min-h-11 min-w-11 items-center justify-center gap-2 px-3 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span>{open ? "Close" : "Menu"}</span>
            <span aria-hidden="true" className="relative block h-2.5 w-5">
              <span className={`absolute left-0 h-px w-5 bg-current transition-transform duration-500 ${open ? "top-1/2 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 h-px w-5 bg-current transition-transform duration-500 ${open ? "top-1/2 -rotate-45" : "bottom-0"}`} />
            </span>
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        ref={menuRef}
        className={`fixed inset-0 z-40 flex flex-col justify-end bg-ink px-(--gutter) pb-10 pt-24 transition-[clip-path] duration-700 ease-in-out-quart md:hidden ${
          open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <nav aria-label="Mobile">
          <ul className="space-y-1">
            {[{ href: "/", label: "Home", n: "00" }, ...NAV].map((item, i) => (
              <li key={item.href} className="overflow-hidden border-b border-line">
                <Link
                  href={item.href}
                  className={`flex items-baseline justify-between py-2 transition-transform duration-700 ease-out-expo ${
                    open ? "translate-y-0" : "translate-y-full"
                  }`}
                  style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  <span className="display text-[17vw] leading-[0.9]">{item.label}</span>
                  <span className="scoreboard tabular text-2xl">{item.n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-8 flex justify-between text-sm text-mute">
          <a href={`mailto:${BRAND.email}`} className="u-link">Email</a>
          <a href={BRAND.instagram.url} target="_blank" rel="noopener noreferrer" className="u-link">
            Instagram {BRAND.instagram.handle}
          </a>
        </div>
      </div>
    </>
  );
}
