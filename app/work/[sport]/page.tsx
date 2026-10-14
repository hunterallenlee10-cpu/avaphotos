import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { FilmStrip } from "@/components/gallery/FilmStrip";
import { Photo } from "@/components/Photo";
import { JsonLd } from "@/components/JsonLd";
import { ArrowLink } from "@/components/ui";
import { BRAND, SITE_URL } from "@/content/site";
import { getSport, pad, sports } from "@/lib/photos";

export const dynamicParams = false;

export function generateStaticParams() {
  return sports.map((s) => ({ sport: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[sport]">): Promise<Metadata> {
  const { sport: slug } = await params;
  const sport = getSport(slug);
  if (!sport) return {};
  const title = slug === "portraits" ? "Senior & Graduation Portraits" : `${sport.name} Photography`;
  return {
    title,
    description: `${sport.name} photography by ${BRAND.person}, sports & portrait photographer and former Stevenson University lacrosse player. ${sport.blurb}`,
    alternates: { canonical: `/work/${slug}` },
    openGraph: { title: `${title} — ${BRAND.person}`, url: `/work/${slug}` },
  };
}

export default async function SportPage({ params }: PageProps<"/work/[sport]">) {
  const { sport: slug } = await params;
  const sport = getSport(slug);
  if (!sport) notFound();
  const next = sports[(sport.index + 1) % sports.length];

  return (
    <div style={{ "--accent": sport.accent } as CSSProperties}>
      {/* Mobile header — on desktop the same content opens the film strip. */}
      <header className="px-(--gutter) pb-10 pt-28 md:hidden">
        <Breadcrumb name={sport.name} />
        <h1 className="reveal-up display mt-8 text-[clamp(4.2rem,22vw,15rem)]">
          {sport.name.split(" ").map((w, i) => (
            <span key={i} className="mask-line"><span>{w}</span></span>
          ))}
        </h1>
        <Count n={sport.photos.length} />
        <p className="fade-up serif mt-6 max-w-[30ch] text-[1.6rem] leading-[1.08]">{sport.blurb}</p>
      </header>

      <FilmStrip
        photos={sport.photos}
        sportName={sport.name}
        intro={
          <>
            <Breadcrumb name={sport.name} />
            <h1 className="reveal-up display mt-auto text-[clamp(4.5rem,9.4vw,10rem)]">
              {sport.name.split(" ").map((w, i) => (
                <span key={i} className="mask-line"><span>{w}</span></span>
              ))}
            </h1>
            <div className="mt-6 flex items-end justify-between gap-6 pr-[3vw]">
              <p className="fade-up serif max-w-[24ch] text-[clamp(1.3rem,1.8vw,1.9rem)] leading-[1.1]">{sport.blurb}</p>
              <Count n={sport.photos.length} />
            </div>
            <p className="label mt-8 flex items-center gap-3 text-mute" aria-hidden="true">
              Scroll <span className="h-px w-16 bg-line" />
            </p>
          </>
        }
      />

      <section className="border-t border-line px-(--gutter) py-16 md:py-28" aria-label="Next gallery">
        <Link href={`/work/${next.slug}`} className="group grid items-end gap-6 md:grid-cols-12" data-cursor="view">
          <div className="md:col-span-8">
            <p className="label mb-4 text-mute">Next field</p>
            <p className="display text-[clamp(3.6rem,12vw,12rem)] transition-transform duration-700 ease-out-expo group-hover:translate-x-3">
              {next.name}
            </p>
            <p className="label mt-6"><ArrowLink>View {pad(next.photos.length)} frames</ArrowLink></p>
          </div>
          <div className="relative hidden aspect-[4/5] overflow-hidden md:col-span-3 md:col-start-10 md:block">
            <Photo
              photo={next.cover}
              fill
              sizes="25vw"
              imgClassName="scale-110 transition-transform duration-[1.4s] ease-out-expo group-hover:scale-100"
            />
          </div>
        </Link>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          name: `${sport.name} — ${BRAND.person}`,
          url: `${SITE_URL}/work/${sport.slug}`,
          author: { "@id": `${SITE_URL}/#ava` },
          image: sport.photos.map((p) => ({
            "@type": "ImageObject",
            contentUrl: `${SITE_URL}${p.src}-1600.webp`,
            description: p.alt,
            width: p.width,
            height: p.height,
            creator: { "@type": "Person", name: BRAND.person },
            copyrightNotice: `© ${BRAND.person}`,
          })),
        }}
      />
    </div>
  );
}

function Breadcrumb({ name }: { name: string }) {
  return (
    <nav aria-label="Breadcrumb" className="label text-mute">
      <Link href="/work" className="u-link">Work</Link>
      <span aria-hidden="true"> / </span>
      <span aria-current="page" className="text-paper">{name}</span>
    </nav>
  );
}

function Count({ n }: { n: number }) {
  return (
    <p className="fade-up flex shrink-0 items-baseline gap-2">
      <span className="scoreboard scoreboard-dots tabular text-[4rem] md:text-[5.5rem]">{pad(n)}</span>
      <span className="label text-mute">Frames</span>
    </p>
  );
}
