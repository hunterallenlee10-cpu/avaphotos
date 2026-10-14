// Usage: node scripts/screenshot.mjs [baseUrl] [path ...]
// Captures full-page screenshots at 1440px and 390px into _qa/shots/.
// Scrolls the page first so scroll-triggered reveals and lazy images resolve.
import { chromium } from "@playwright/test";
import fs from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
const paths = process.argv.slice(3).length ? process.argv.slice(3) : ["/"];
const outDir = "_qa/shots";
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: "1440", width: 1440, height: 900, mobile: false },
  { name: "390", width: 390, height: 844, mobile: true },
];

const browser = await chromium.launch(
  process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
);
for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    reducedMotion: process.env.REDUCED ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: "networkidle" });
    await page.waitForTimeout(1800);
    // first viewport (above the fold) as its own shot
    const slug = p === "/" ? "home" : p.replace(/\//g, "_").replace(/^_/, "");
    await page.screenshot({ path: `${outDir}/${slug}-${vp.name}-fold.png` });
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += vp.height * 0.6) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${outDir}/${slug}-${vp.name}-full.png`, fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    console.log(`${p} @${vp.name}: height=${h} overflowX=${overflow}${errors.length ? " errors=" + JSON.stringify(errors) : ""}`);
    errors.length = 0;
  }
  await ctx.close();
}
await browser.close();
