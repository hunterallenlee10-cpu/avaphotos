import { renderOg, ogSize } from "@/lib/og";
import { BRAND } from "@/content/site";

export const alt = `${BRAND.person} — sports & portrait photographer`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg({ photoId: "soccer-strike-3-06", title: `${BRAND.firstName}\n${BRAND.lastName}`, kicker: "Sports & portrait photographer" });
}
