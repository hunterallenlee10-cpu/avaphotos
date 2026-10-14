import type { ImageLoaderProps } from "next/image";

/** Widths written by scripts/process-images.ts. */
const AVAILABLE = [640, 828, 1080, 1600, 2400];

/** Round a requested width up to the nearest pre-generated variant that the
 *  photo actually has (smaller originals may stop below 2400). */
export function pickWidth(width: number, widths: number[] = AVAILABLE) {
  return widths.find((w) => w >= width) ?? widths[widths.length - 1];
}

export const makeLoader =
  (format: "avif" | "webp", widths?: number[]) =>
  ({ src, width }: ImageLoaderProps) =>
    `${src}-${pickWidth(width, widths)}.${format}`;
