import { renderOg, ogSize } from "@/lib/og";
import { BRAND } from "@/content/site";
import { getSport, sports } from "@/lib/photos";

export const alt = `${BRAND.person} — sports photography`;
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return sports.map((s) => ({ sport: s.slug }));
}

export default async function Image({ params }: { params: Promise<{ sport: string }> }) {
  const { sport: slug } = await params;
  const sport = getSport(slug)!;
  return renderOg({
    photoId: sport.cover.id,
    title: sport.name.replace(" & ", "\n& "),
    kicker: `${BRAND.person} · ${slug === "portraits" ? "Portrait" : "Sports"} photography`,
    accent: sport.accent,
  });
}
