import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/Photo";
import { Parallax } from "@/components/motion/Parallax";
import { MaskedHeadline, SectionHead, Txt } from "@/components/ui";
import { BRAND, CONTACT, SERVICES } from "@/content/site";
import { getPhoto } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Services — Game Day, Media Day, Athlete Shoots & Senior Portraits",
  description: `Book ${BRAND.person} for game day coverage, team & media days, athlete individual shoots for recruiting and social, and senior & graduation portraits.`,
  alternates: { canonical: "/services" },
  openGraph: { url: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <section className="px-(--gutter) pb-16 pt-28 md:pb-28 md:pt-40" aria-labelledby="services-title">
        <MaskedHeadline as="h1" lines={SERVICES.title} className="text-[clamp(4rem,13vw,14rem)]" />
        <span id="services-title" className="sr-only">Services</span>
        <p className="fade-up serif mt-10 max-w-[32ch] text-[clamp(1.5rem,2.6vw,2.4rem)] leading-[1.08] md:ml-[41.6%]">{SERVICES.intro}</p>
      </section>

      <section aria-label="Services" className="px-(--gutter)">
        <ol className="space-y-24 md:space-y-40">
          {SERVICES.list.map((s, i) => {
            const p = getPhoto(s.photo);
            const flip = i % 2 === 1;
            const occasion = CONTACT.occasions[i] ?? "";
            return (
              <li key={s.n} id={s.n} className="scroll-mt-28 grid gap-8 md:grid-cols-12 md:gap-6">
                <div className={`relative md:col-span-5 ${flip ? "md:order-2 md:col-start-8" : ""}`}>
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Parallax amount={14} className="absolute inset-x-0 -top-[8%] h-[116%]">
                      <Photo photo={p} fill sizes="(min-width: 768px) 40vw, 100vw" eager={i === 0} />
                    </Parallax>
                  </div>
                </div>
                <div className={`flex flex-col md:col-span-6 ${flip ? "md:order-1 md:col-start-1" : "md:col-start-7"} md:pt-12`}>
                  <span className="scoreboard scoreboard-dots tabular text-[4rem] md:text-[6rem]" aria-hidden="true">{s.n}</span>
                  <h2 className="display mt-4 text-[clamp(3rem,6.2vw,6.4rem)]">{s.name}</h2>
                  <p className="fade-up mt-6 max-w-[44ch] text-lg text-paper/85">{s.body}</p>
                  <ul className="mt-8 border-t border-line">
                    {s.includes.map((inc) => (
                      <li key={inc} className="flex items-center gap-4 border-b border-line py-3 text-sm">
                        <span className="h-1.5 w-1.5 rotate-45 bg-amber" aria-hidden="true" />
                        {inc}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
                    <p>
                      <span className="label mr-3 text-mute">Starting at</span>
                      <span className="display text-3xl"><Txt>{s.price}</Txt></span>
                    </p>
                    <Link
                      href={`/contact?for=${encodeURIComponent(occasion)}`}
                      className="group inline-flex min-h-12 items-center gap-3 border border-paper/40 px-5 text-sm font-medium transition-colors duration-500 hover:border-amber hover:bg-amber hover:text-ink"
                    >
                      Book {s.name.split(" ")[0] === "Senior" ? "portraits" : "this"}
                      <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="px-(--gutter) py-24 md:py-40" aria-labelledby="process">
        <SectionHead n="05" label="How it works" className="mb-12 md:mb-16" />
        <h2 id="process" className="sr-only">How booking works</h2>
        <ol className="grid gap-px bg-line md:grid-cols-4">
          {SERVICES.process.map((step) => (
            <li key={step.n} className="fade-up bg-ink py-8 md:px-6 md:py-10 md:first:pl-0">
              <span className="scoreboard tabular text-4xl">{step.n}</span>
              <h3 className="display mt-6 text-4xl">{step.title}</h3>
              <p className="mt-3 max-w-[30ch] text-paper/80"><Txt>{step.body}</Txt></p>
            </li>
          ))}
        </ol>
        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-line pt-10 md:flex-row md:items-center">
          <p className="serif text-[clamp(1.8rem,3.4vw,3rem)] leading-tight">Don’t see your thing? Ask anyway.</p>
          <Link href="/contact" className="group inline-flex min-h-14 items-center gap-3 bg-amber px-6 font-semibold text-ink transition-colors duration-500 hover:bg-paper">
            Start a booking <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
