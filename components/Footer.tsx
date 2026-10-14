import Link from "next/link";
import { BRAND, FOOTER, NAV } from "@/content/site";
import { sports } from "@/lib/photos";

const YEAR = new Date().getFullYear(); // evaluated at build time — pages are static

export function Footer() {
  return (
    <footer className="relative border-t border-line px-(--gutter) pb-8 pt-16 md:pt-24">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="serif max-w-[18ch] text-[clamp(1.9rem,3.6vw,3.2rem)] leading-[1.02]">{FOOTER.line}</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 text-sm md:col-span-6 md:grid-cols-3">
          <div>
            <p className="label mb-4 text-mute">Site</p>
            <ul className="space-y-2">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="u-link">{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label mb-4 text-mute">Work</p>
            <ul className="space-y-2">
              {sports.map((s) => (
                <li key={s.slug}>
                  <Link href={`/work/${s.slug}`} className="u-link">{s.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="label mb-4 text-mute">Say hi</p>
            <ul className="space-y-2">
              <li>
                <a href={`mailto:${BRAND.email}`} className="u-link break-all">{BRAND.email}</a>
              </li>
              <li>
                <a href={BRAND.instagram.url} target="_blank" rel="noopener noreferrer" className="u-link">
                  Instagram {BRAND.instagram.handle}
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
      <div
        aria-hidden="true"
        data-word={`${BRAND.firstName}\u00a0${BRAND.lastName}`}
        className="ghost-word display mt-16 select-none overflow-hidden whitespace-nowrap text-[20.5vw] leading-[0.78] tracking-[-0.02em] text-ink-3 md:mt-24"
      />
      <div className="label mt-6 flex flex-col gap-2 text-mute md:flex-row md:justify-between">
        <span>© {YEAR} {BRAND.name}</span>
        <span>All photographs © {BRAND.person}. Please don’t reuse without permission.</span>
      </div>
    </footer>
  );
}
