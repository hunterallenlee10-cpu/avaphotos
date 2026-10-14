import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { Photo } from "@/components/Photo";
import { Parallax } from "@/components/motion/Parallax";
import { ArrowLink, MaskedHeadline, SectionHead } from "@/components/ui";
import { BRAND, HOME, SERVICES } from "@/content/site";
import { getPhoto, getSport, pad } from "@/lib/photos";

const HERO = [
  "lacrosse-huddle-lights",
  "soccer-arms-raised",
  "bvb-spike-net",
  "baseball-catcher-dust",
  "portraits-cap-toss",
  "football-broken-tackle",
];

/** Featured mosaic: three staggered columns of different widths, each
 *  drifting at its own speed. Order inside a column is top → bottom. */
const MOSAIC: { ids: string[]; className: string; drift: number }[] = [
  { ids: ["soccer-lights-portrait", "portraits-boardwalk", "baseball-helmet-stare"], className: "md:w-[41%]", drift: 0 },
  { ids: ["soccer-strike-3-06", "football-sideline-smile", "lacrosse-number-25"], className: "md:w-[31%] md:pt-[16vw]", drift: 10 },
  { ids: ["bvb-jump-serve", "portraits-fall-walk"], className: "md:w-[22%] md:pt-[7vw]", drift: -8 },
];
const MOSAIC_COUNT = MOSAIC.reduce((n, c) => n + c.ids.length, 0);

export default function Home() {
  const frames = HERO.map((id) => {
    const p = getPhoto(id);
    const s = getSport(p.sport)!;
    return { ...p, href: `/work/${s.slug}`, sportName: s.name };
  });
  const breaker = getPhoto("lacrosse-chase");

  return (
    <>
      <Hero frames={frames} />

      {/* ── Intro ─────────────────────────────────────────── */}
      <section className="px-(--gutter) pb-24 pt-20 md:pb-40 md:pt-36" aria-labelledby="intro">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <SectionHead n="01" label="Intro" />
          </div>
          <p id="intro" className="fade-up serif text-[clamp(2rem,5.2vw,5.4rem)] leading-[0.98] md:col-span-9">
            {HOME.intro}
          </p>
        </div>
      </section>

      {/* ── Featured mosaic ───────────────────────────────── */}
      <section className="px-(--gutter) pb-24 md:pb-44" aria-labelledby="featured">
        <div className="mb-14 flex items-end justify-between gap-6 md:mb-24">
          <MaskedHeadline lines={[HOME.featuredTitle]} className="text-[clamp(3.4rem,10vw,10rem)]" />
          <Link href="/work" className="label shrink-0 pb-2">
            <ArrowLink>All work</ArrowLink>
          </Link>
        </div>
        <h2 id="featured" className="sr-only">{HOME.featuredTitle}</h2>
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-[3%]">
          {MOSAIC.map((col, ci) => (
            <Parallax key={ci} amount={col.drift} desktopOnly className={col.className}>
              <ul className="flex flex-col gap-10 md:block md:space-y-[5vw]">
                {col.ids.map((id, i) => {
                  const p = getPhoto(id);
                  const s = getSport(p.sport)!;
                  const n = MOSAIC.slice(0, ci).reduce((acc, c) => acc + c.ids.length, 0) + i + 1;
                  const landscape = p.width > p.height;
                  return (
                    <li key={id} className={`fade-up ${!landscape && n % 2 === 0 ? "ml-auto w-[72%] md:ml-0 md:w-auto" : ""}`}>
                      <Link href={`/work/${s.slug}`} data-cursor="view" className="group block" aria-label={`${s.name}: ${p.alt}`}>
                        <figure>
                          <div className="overflow-hidden">
                            <Photo
                              photo={p}
                              sizes="(min-width: 768px) 40vw, 92vw"
                              imgClassName="transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.04]"
                            />
                          </div>
                          <figcaption className="mt-3 flex items-baseline justify-between gap-3 text-xs text-mute">
                            <span><span className="smallcaps text-paper/90">{s.name}</span> <span className="hidden md:inline">· {p.caption}</span></span>
                            <span className="tabular">{pad(n)} / {pad(MOSAIC_COUNT)}</span>
                          </figcaption>
                        </figure>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Parallax>
          ))}
        </div>
      </section>

      {/* ── Story: an athlete who shoots athletes ─────────── */}
      <section className="px-(--gutter) pb-20 md:pb-36" aria-labelledby="story">
        <SectionHead n="02" label={HOME.story.eyebrow} className="mb-12 md:mb-20" />
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <div className="md:sticky md:top-28">
              <h2 id="story" className="sr-only">{HOME.story.headline.join(" ")}</h2>
              <MaskedHeadline as="h3" lines={HOME.story.headline} className="text-[clamp(4rem,11.5vw,12rem)]" />
            </div>
          </div>
          <div className="space-y-6 text-[1.075rem] leading-relaxed text-paper/85 md:col-span-5 md:col-start-8 md:pt-4 md:text-lg">
            {HOME.story.paragraphs.map((p, i) => (
              <p key={i} className={`fade-up ${i === HOME.story.paragraphs.length - 1 ? "serif !text-[1.9rem] leading-tight text-paper md:!text-[2.4rem]" : ""}`}>
                {p}
              </p>
            ))}
            <dl className="!mt-14 grid grid-cols-3 border-t border-line">
              {HOME.story.stats.map((s) => (
                <div key={s.label} className="fade-up flex flex-col border-r border-line pr-3 pt-5 last:border-r-0 [&:not(:first-child)]:pl-3">
                  <dt className="label order-2 mt-3 text-mute">{s.label}</dt>
                  <dd className="scoreboard order-1 text-[clamp(1.9rem,3.6vw,3.4rem)]">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── Grid-breaker ───────────────────────────────────── */}
      <section aria-label="Photograph" className="relative h-[78svh] overflow-hidden md:h-[115vh]">
        <Parallax amount={18} className="absolute inset-x-0 -top-[10%] h-[120%]">
          <Photo photo={breaker} fill sizes="100vw" />
        </Parallax>
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(10_11_10/0.75),transparent_45%)]" />
        <p className="absolute bottom-6 left-(--gutter) right-(--gutter) flex items-baseline justify-between gap-6 md:bottom-10">
          <span className="serif max-w-[22ch] text-[clamp(1.5rem,3vw,2.8rem)] leading-[1.02]">
            The play happens fast. I’m already looking where it’s going.
          </span>
          <span className="smallcaps hidden text-sm text-paper/75 md:inline">Lacrosse · {breaker.caption}</span>
        </p>
      </section>

      {/* ── Services teaser ────────────────────────────────── */}
      <section className="px-(--gutter) py-24 md:py-40" aria-labelledby="services">
        <SectionHead n="03" label="Services" className="mb-12 md:mb-16" />
        <h2 id="services" className="sr-only">{HOME.servicesTitle}</h2>
        <ul className="border-t border-line">
          {SERVICES.list.map((s) => (
            <li key={s.n} className="fade-up border-b border-line">
              <Link href={`/services#${s.n}`} className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-6 md:grid-cols-12 md:gap-6 md:py-9">
                <span className="scoreboard tabular text-2xl md:col-span-1 md:text-3xl">{s.n}</span>
                <span className="display text-[clamp(2rem,6.4vw,6.4rem)] transition-transform duration-700 ease-out-expo group-hover:translate-x-3 md:col-span-7">
                  {s.name}
                </span>
                <span className="hidden max-w-[34ch] text-sm text-mute md:col-span-3 md:block">{s.body}</span>
                <span aria-hidden="true" className="justify-self-end text-2xl transition-transform duration-500 ease-out-expo group-hover:translate-x-1 md:col-span-1">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Booking CTA ────────────────────────────────────── */}
      <section className="relative overflow-hidden px-(--gutter) pb-28 pt-10 md:pb-44" aria-labelledby="cta">
        <MaskedHeadline lines={HOME.ctaTitle} className="text-[clamp(4.6rem,16vw,17rem)]" />
        <h2 id="cta" className="sr-only">{HOME.ctaTitle.join(" ")}</h2>
        <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12">
          <p className="fade-up max-w-[40ch] text-lg text-paper/85 md:col-span-5 md:col-start-6">{HOME.ctaBody}</p>
          <div className="fade-up flex flex-col items-start gap-4 md:col-span-2 md:col-start-11 md:items-end">
            <Link
              href="/contact"
              className="group inline-flex min-h-14 items-center gap-3 bg-amber px-6 font-semibold text-ink transition-[background-color,transform] duration-500 hover:bg-paper"
            >
              {HOME.ctaButton}
              <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </Link>
            <a href={`mailto:${BRAND.email}`} className="u-link text-sm text-mute">or email me</a>
          </div>
        </div>
      </section>
    </>
  );
}
