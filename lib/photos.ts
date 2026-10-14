import photosJson from "@/content/photos.json";
import { SPORTS, type SportMeta } from "@/content/site";

export type Photo = {
  id: string;
  src: string;
  sport: string;
  width: number;
  height: number;
  blur: string;
  dominant: string;
  alt: string;
  caption: string;
  featured: boolean;
  focus: string;
  widths: number[];
};

export const photos = photosJson as Photo[];

const byId = new Map(photos.map((p) => [p.id, p]));

export function getPhoto(id: string): Photo {
  const p = byId.get(id);
  if (!p) throw new Error(`Unknown photo id "${id}" — check content/site.ts against content/photos.json`);
  return p;
}

export const featured = photos.filter((p) => p.featured);

export type Sport = SportMeta & {
  photos: Photo[];
  cover: Photo;
  index: number;
};

export const sports: Sport[] = SPORTS.map((meta, index) => {
  const list = photos.filter((p) => p.sport === meta.slug);
  const cover = list.find((p) => p.featured) ?? list[0];
  return { ...meta, photos: list, cover, index };
}).filter((s) => s.photos.length > 0);

export function getSport(slug: string) {
  return sports.find((s) => s.slug === slug);
}

export { pad } from "./format";
