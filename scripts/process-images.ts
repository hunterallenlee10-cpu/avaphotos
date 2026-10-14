/**
 * Image pipeline — run with `npm run images`.
 *
 * Reads originals from ./_source (never committed), applies the curation in
 * scripts/curation.json, and writes:
 *   public/photos/<id>-<width>.avif|webp   responsive variants at 640–2400px (EXIF/GPS stripped)
 *   content/photos.json                    metadata consumed by the site
 *
 * Re-runs are incremental: variants that already exist and are newer than the
 * source file are skipped. Pass --force to rebuild everything.
 */
import fs from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import sharp, { type Sharp } from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(ROOT, "_source");
const OUT = path.join(ROOT, "public/photos");
const CURATION = path.join(ROOT, "scripts/curation.json");
const MANIFEST = path.join(ROOT, "content/photos.json");

export const WIDTHS = [640, 828, 1080, 1600, 2400] as const;
const FORCE = process.argv.includes("--force");

type CurationEntry = {
  src: string;
  id: string;
  sport: string;
  alt: string;
  caption?: string;
  featured?: boolean;
  focus?: string;
  grade?: "night";
  exclude?: string;
};

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

const hex = (n: number) => n.toString(16).padStart(2, "0");

/** Night-game correction for the RAW lacrosse set: set black/white points,
 *  add a touch of contrast and colour so it sits with Ava's edited work. */
function applyGrade(img: Sharp, grade?: CurationEntry["grade"]) {
  if (grade !== "night") return img;
  return img
    .normalise({ lower: 0.5, upper: 99.7 })
    .linear(1.08, -6)
    .modulate({ saturation: 1.15, brightness: 1.03 });
}

function isFresh(out: string, srcMtime: number) {
  return !FORCE && existsSync(out) && statSync(out).mtimeMs > srcMtime;
}

async function processOne(entry: CurationEntry): Promise<Photo> {
  const file = path.join(SOURCE, entry.src);
  const srcMtime = statSync(file).mtimeMs;

  // Decode once: auto-rotate from EXIF orientation, grade, and drop all
  // metadata (sharp only writes metadata when .withMetadata() is called, so
  // EXIF — including GPS — never reaches the output files).
  const base = await applyGrade(sharp(file).rotate(), entry.grade)
    .toColourspace("srgb")
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = base.info;
  const pipeline = () => sharp(base.data, { raw: { width, height, channels } });

  const widths: number[] = WIDTHS.filter((w) => w <= width);
  if (widths.length === 0 || widths.at(-1)! < width) widths.push(Math.min(width, WIDTHS.at(-1)!));
  const uniqueWidths = [...new Set(widths)];

  await Promise.all(
    uniqueWidths.flatMap((w) => {
      const avif = path.join(OUT, `${entry.id}-${w}.avif`);
      const webp = path.join(OUT, `${entry.id}-${w}.webp`);
      return [
        isFresh(avif, srcMtime)
          ? null
          : pipeline().resize({ width: w }).avif({ quality: w >= 1600 ? 52 : 56, effort: 5 }).toFile(avif),
        isFresh(webp, srcMtime)
          ? null
          : pipeline().resize({ width: w }).webp({ quality: 78, effort: 5 }).toFile(webp),
      ];
    }),
  );

  // Tiny blurred placeholder, inlined as a data URI.
  const blurBuf = await pipeline().resize({ width: 16 }).blur(1.2).webp({ quality: 40 }).toBuffer();
  const { dominant } = await pipeline().stats();

  return {
    id: entry.id,
    src: `/photos/${entry.id}`,
    sport: entry.sport,
    width,
    height,
    blur: `data:image/webp;base64,${blurBuf.toString("base64")}`,
    dominant: `#${hex(dominant.r)}${hex(dominant.g)}${hex(dominant.b)}`,
    alt: entry.alt,
    caption: entry.caption ?? "",
    featured: Boolean(entry.featured),
    focus: entry.focus ?? "50% 50%",
    widths: uniqueWidths,
  };
}

async function main() {
  const { photos: curation } = JSON.parse(await fs.readFile(CURATION, "utf8")) as {
    photos: CurationEntry[];
  };
  await fs.mkdir(OUT, { recursive: true });
  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });

  const ids = new Set<string>();
  const keep = curation.filter((c) => {
    if (ids.has(c.id)) throw new Error(`Duplicate id ${c.id}`);
    ids.add(c.id);
    if (!existsSync(path.join(SOURCE, c.src))) {
      console.warn(`! missing source ${c.src} — skipping`);
      return false;
    }
    return !c.exclude;
  });

  const results: Photo[] = [];
  // Small concurrency: each decode holds a full-resolution raw buffer.
  const queue = [...keep];
  await Promise.all(
    Array.from({ length: 3 }, async () => {
      for (let c = queue.shift(); c; c = queue.shift()) {
        const photo = await processOne(c);
        results.push(photo);
        console.log(`✓ ${photo.id} ${photo.width}×${photo.height} ${photo.dominant}`);
      }
    }),
  );

  // Preserve curation order.
  const order = new Map(keep.map((c, i) => [c.id, i]));
  results.sort((a, b) => order.get(a.id)! - order.get(b.id)!);

  // Remove variants for frames that are no longer curated.
  const valid = new Set(results.map((p) => p.id));
  for (const f of await fs.readdir(OUT)) {
    const m = f.match(/^(.*)-\d+\.(avif|webp)$/);
    if (m && !valid.has(m[1])) await fs.rm(path.join(OUT, f));
  }

  await fs.writeFile(MANIFEST, JSON.stringify(results, null, 2) + "\n");
  const bySport = results.reduce<Record<string, number>>((acc, p) => {
    acc[p.sport] = (acc[p.sport] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`\n${results.length} photos → content/photos.json`, bySport);
  console.log(`featured: ${results.filter((p) => p.featured).length}`);
  console.log(`excluded: ${curation.filter((c) => c.exclude).map((c) => c.id).join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
