import type { Metadata } from "next";
import { BookingForm } from "@/components/contact/BookingForm";
import { Photo } from "@/components/Photo";
import { MaskedHeadline, Txt } from "@/components/ui";
import { BRAND, CONTACT } from "@/content/site";
import { getPhoto } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Book a Shoot",
  description: `Book ${BRAND.person} for game day coverage, team & media days, athlete shoots, or senior & graduation portraits.`,
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact" },
};

export default function ContactPage() {
  const side = getPhoto("soccer-scoreboard-turn");
  return (
    <section className="px-(--gutter) pb-24 pt-28 md:pb-40 md:pt-40" aria-labelledby="contact-title">
      <MaskedHeadline as="h1" lines={CONTACT.title} className="text-[clamp(4rem,12.5vw,13rem)]" />
      <span id="contact-title" className="sr-only">Book a shoot with {BRAND.person}</span>

      <div className="mt-14 grid gap-16 md:mt-24 md:grid-cols-12 md:gap-6">
        <aside className="md:col-span-4">
          <p className="fade-up serif text-[clamp(1.5rem,2.4vw,2.2rem)] leading-[1.1]">{CONTACT.intro}</p>
          <dl className="mt-10 space-y-6 border-t border-line pt-8">
            <div>
              <dt className="label text-mute">Email</dt>
              <dd className="mt-1 text-lg">
                <a href={`mailto:${BRAND.email}`} className="u-link break-all">{BRAND.email}</a>
              </dd>
            </div>
            <div>
              <dt className="label text-mute">Instagram</dt>
              <dd className="mt-1 text-lg">
                <a href={BRAND.instagram.url} target="_blank" rel="noopener noreferrer" className="u-link">
                  {BRAND.instagram.handle}
                </a>
              </dd>
            </div>
            <div>
              <dt className="label text-mute">Based in</dt>
              <dd className="mt-1 text-lg"><Txt>{BRAND.serviceArea}</Txt></dd>
            </div>
          </dl>
          <div className="mt-12 hidden md:block">
            <Photo photo={side} sizes="30vw" />
            <p className="smallcaps mt-3 text-xs text-mute">Soccer · {side.caption}</p>
          </div>
        </aside>
        <div className="md:col-span-7 md:col-start-6">
          <BookingForm />
        </div>
      </div>
    </section>
  );
}
