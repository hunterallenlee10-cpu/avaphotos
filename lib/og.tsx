import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { BRAND } from "@/content/site";

export const ogSize = { width: 1200, height: 630 };

const font = (f: string) => readFile(join(process.cwd(), "assets/fonts", f));
const fontsP = Promise.all([
  font("BigShoulders-Display-ExtraBold.ttf"),
  font("InstrumentSerif-Italic.ttf"),
  font("InterTight-Medium.ttf"),
]);

/** Shared Open Graph card: a featured frame with her name set over it. */
export async function renderOg({ photoId, title, kicker, accent = "#F2B33D" }: { photoId: string; title: string; kicker: string; accent?: string }) {
  const [display, serif, sans] = await fontsP;
  // Satori can't read AVIF/WebP: crop the 1080 variant to the card's photo panel as JPEG.
  const img = (
    await sharp(join(process.cwd(), "public/photos", `${photoId}-1080.webp`))
      .resize(640, 630, { fit: "cover", position: sharp.strategy.attention })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer()
  ).toString("base64");
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0a0b0a" }}>
        <div style={{ width: 560, height: 630, padding: "56px 0 52px 64px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", fontFamily: "Inter Tight", fontSize: 18, letterSpacing: 3, color: "#a7a298", textTransform: "uppercase" }}>
            <div style={{ width: 28, height: 2, background: accent, marginRight: 14 }} />
            {kicker}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "Big Shoulders",
                fontSize: title.replace("\n", "").length > 12 ? 112 : 150,
                lineHeight: 0.84,
                color: "#f2eee6",
                textTransform: "uppercase",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {title.split("\n").map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
            <div style={{ display: "flex", marginTop: 24, fontFamily: "Instrument Serif", fontStyle: "italic", fontSize: 38, color: accent }}>
              An athlete who shoots athletes.
            </div>
          </div>
          <div style={{ display: "flex", fontFamily: "Inter Tight", fontSize: 18, color: "#f2eee6" }}>
            {BRAND.instagram.handle} · {BRAND.name}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/jpeg;base64,${img}`} width={640} height={630} alt="" style={{ objectFit: "cover" }} />
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Big Shoulders", data: display, weight: 800, style: "normal" },
        { name: "Instrument Serif", data: serif, weight: 400, style: "italic" },
        { name: "Inter Tight", data: sans, weight: 500, style: "normal" },
      ],
    },
  );
}
