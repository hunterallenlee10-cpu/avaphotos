// Usage: node scripts/scroll-shots.mjs <url> <name> <y1> <y2> ... — viewport shots at scroll offsets (1440×900)
import { chromium } from "@playwright/test";
const [url, name, ...ys] = process.argv.slice(2);
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: Number(process.env.W ?? 1440), height: Number(process.env.H ?? 900) } });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
for (const y of ys) {
  await page.mouse.move(700, 450);
  // wheel-scroll so Lenis + ScrollTrigger see real input
  let cur = await page.evaluate(() => window.scrollY);
  while (Math.abs(cur - Number(y)) > 50) {
    await page.mouse.wheel(0, Math.sign(Number(y) - cur) * Math.min(400, Math.abs(Number(y) - cur)));
    await page.waitForTimeout(60);
    cur = await page.evaluate(() => window.scrollY);
  }
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `_qa/shots/${name}-${y}.png` });
}
await browser.close();
