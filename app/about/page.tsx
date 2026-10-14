import type { Metadata } from "next";
import Link from "next/link";
import { Timeline } from "@/components/about/Timeline";
import { MaskedHeadline, SectionHead, Txt } from "@/components/ui";
import { ABOUT, BRAND, HOME } from "@/content/site";
import { getPhoto } from "@/lib/photos";

export const metadata: Metadata = {
  title: "About Ava",
  description: `${BRAND.person} is a sports and portrait photographer from Virginia, a Stevenson University women’s lacrosse alum, and an athletic training (MSAT) student at King’s.`,
  alternates: { canonical: "/about" },
  openGraph: { url: "/about" },
};

export default function AboutPage() {
  const stops = ABOUT.timeline.map((s) => ({ ...s, photo: s.photo ? getPhoto(s.photo) : null }));

  return (
    <>
      <section className="px-(--gutter) pb-20 pt-28 md:pb-36 md:pt-40" aria-labelledby="about-title">
        <MaskedHeadline as="h1" lines={ABOUT.title} className="text-[clamp(3.8rem,12.5vw,13rem)]" />
        <span id="about-title" className="sr-only">About {BRAND.person}</span>

        <div className="mt-14 grid gap-12 md:mt-24 md:grid-cols-12">
          <div className="fade-up md:col-span-5">
            {/* [[AVA HEADSHOT]] — swap for <Photo> once Ava approves a portrait */}
            <div
              role="img"
              aria-label={`${ABOUT.headshotAlt} (placeholder)`}
              className="crop-marks relative grid aspect-[4/5] place-items-center bg-ink-2 [--c:26px]"
            >
              <div className="text-center">
                <p className="display text-[clamp(3rem,6vw,5.5rem)] text-ink-3">AVA</p>
                <p className="mt-3 text-sm"><Txt>[[AVA HEADSHOT]]</Txt></p>
              </div>
            </div>
          </div>
          <div className="md:col-span-6 md:col-start-7 md:pt-10">
            <p className="fade-up serif text-[clamp(1.8rem,3.2vw,3rem)] leading-[1.05]">{ABOUT.lede}</p>
            <div className="mt-10 space-y-5 text-[1.05rem] leading-relaxed text-paper/85">
              {ABOUT.body.map((p, i) => (
                <p key={i} className="fade-up">{p}</p>
              ))}
            </div>
            <dl className="mt-12 grid grid-cols-3 border-t border-line">
              {HOME.story.stats.map((s) => (
                <div key={s.label} className="fade-up flex flex-col border-r border-line pr-3 pt-5 last:border-r-0 [&:not(:first-child)]:pl-3">
                  <dt className="label order-2 mt-3 text-mute">{s.label}</dt>
                  <dd className="scoreboard order-1 text-[clamp(1.7rem,3vw,3rem)]">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="px-(--gutter) pb-24 md:pb-40" aria-labelledby="timeline">
        <SectionHead n="01" label="The road here" className="mb-10 md:mb-16" />
        <MaskedHeadline lines={[ABOUT.timelineTitle]} className="mb-16 text-[clamp(3.6rem,10vw,10rem)] md:mb-28" />
        <h2 id="timeline" className="sr-only">Timeline, 2021 to now</h2>
        <Timeline stops={stops} />
      </section>

      <section className="border-t border-line px-(--gutter) py-20 md:py-32" aria-label="Testimonial">
        <figure className="fade-up mx-auto max-w-4xl text-center">
          <blockquote className="serif text-[clamp(1.8rem,3.4vw,3rem)] leading-[1.1]">
            <Txt>{ABOUT.testimonial}</Txt>
          </blockquote>
        </figure>
        <div className="mt-14 flex justify-center">
          <Link href="/contact" className="group inline-flex min-h-14 items-center gap-3 bg-amber px-6 font-semibold text-ink transition-colors duration-500 hover:bg-paper">
            Work with me <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
