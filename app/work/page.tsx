import type { Metadata } from "next";
import { WorkIndex } from "@/components/gallery/WorkIndex";
import { MaskedHeadline } from "@/components/ui";
import { BRAND, WORK } from "@/content/site";
import { photos, sports } from "@/lib/photos";
import { pad } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Work — Sports & Portrait Photography",
  description: `Football, soccer, lacrosse, baseball, beach volleyball, and senior & graduation portraits by ${BRAND.person}.`,
  alternates: { canonical: "/work" },
  openGraph: { url: "/work" },
};

export default function WorkPage() {
  const items = sports.map((s) => ({
    slug: s.slug,
    name: s.name,
    blurb: s.blurb,
    cover: s.cover,
    accent: s.accent,
    count: s.photos.length,
    // cover first, then up to three more for the hover flick-through
    previews: [s.cover, ...s.photos.filter((p) => p.id !== s.cover.id)].slice(0, 4),
  }));

  return (
    <div className="px-(--gutter) pb-24 pt-28 md:pb-40 md:pt-40">
      <div className="mb-14 grid gap-8 md:mb-24 md:grid-cols-12 md:items-end">
        <MaskedHeadline as="h1" lines={[WORK.title]} className="text-[clamp(4.6rem,17vw,17rem)] md:col-span-8" />
        <div className="fade-up md:col-span-4 md:pb-4 md:text-right">
          <p className="serif text-[clamp(1.4rem,2.2vw,2rem)] leading-tight">{WORK.intro}</p>
          <p className="label mt-4 text-mute">
            {pad(sports.length)} fields · {pad(photos.length)} frames
          </p>
        </div>
      </div>
      <WorkIndex items={items} />
    </div>
  );
}
