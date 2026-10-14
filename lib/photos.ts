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
  accent: string;
  index: number;
};

/** Mix a photo's dominant colour toward the stadium-amber accent so per-gallery
 *  accents stay legible on ink while still echoing the frames. */
function deriveAccent(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  if (d) {
    const rr = r / 255, gg = g / 255, bb = b / 255;
    if (max === rr) h = ((gg - bb) / d) % 6;
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  // Keep the hue, force readable saturation/lightness on a near-black ground.
  return `hsl(${Math.round(h)} ${Math.round(Math.max(45, Math.min(80, s * 100)))}% 62%)`;
}

export const sports: Sport[] = SPORTS.map((meta, index) => {
  const list = photos.filter((p) => p.sport === meta.slug);
  const cover = list.find((p) => p.featured) ?? list[0];
  // The most saturated dominant colour in the set makes the best accent.
  const accentSource =
    [...list].sort((a, b) => saturation(b.dominant) - saturation(a.dominant))[0]?.dominant ?? "#f2b33d";
  return { ...meta, photos: list, cover, accent: deriveAccent(accentSource), index };
}).filter((s) => s.photos.length > 0);

function saturation(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return Math.max(...c) - Math.min(...c);
}

export function getSport(slug: string) {
  return sports.find((s) => s.slug === slug);
}

export const pad = (n: number) => String(n).padStart(2, "0");
