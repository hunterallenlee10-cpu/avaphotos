import type { MetadataRoute } from "next";
import { SITE_URL } from "@/content/site";
import { sports } from "@/lib/photos";

// Fixed date keeps the route static; bump when content changes meaningfully.
const UPDATED = "2026-10-14";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/work", "/about", "/services", "/contact"].map((p, i) => ({
    url: `${SITE_URL}${p}`,
    lastModified: UPDATED,
    changeFrequency: "monthly" as const,
    priority: i === 0 ? 1 : 0.8,
  }));
  const galleries = sports.map((s) => ({
    url: `${SITE_URL}/work/${s.slug}`,
    lastModified: UPDATED,
    changeFrequency: "monthly" as const,
    priority: 0.7,
    images: s.photos.map((p) => `${SITE_URL}${p.src}-1600.webp`),
  }));
  return [...pages, ...galleries];
}
