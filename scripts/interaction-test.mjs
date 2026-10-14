// Smoke-tests interactions against a running build: node scripts/interaction-test.mjs http://localhost:3100
import { chromium } from "@playwright/test";
const base = process.argv[2] ?? "http://localhost:3100";
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const shot = (page, n) => page.screenshot({ path: `_qa/shots/it-${n}.png` });
const ok = (c, m) => console.log(`${c ? "PASS" : "FAIL"}  ${m}`);

// 1. Lightbox — desktop
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base + "/work/baseball", { waitUntil: "networkidle" });
  const first = page.locator("section:visible button[data-cursor=view]").first();
  await first.focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(900);
  ok(await page.locator("dialog[open]").count() === 1, "lightbox opens with keyboard");
  const counter = () => page.locator("dialog[open] .scoreboard").first().textContent();
  ok((await counter()) === "01", "counter starts at 01");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(500);
  ok((await counter()) === "02", "ArrowRight → 02");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(500);
  ok((await counter()) === "09", "wraps to last frame");
  await page.mouse.dblclick(720, 450);
  await page.waitForTimeout(700);
  const zoomed = await page.locator("dialog[open] .lightbox-frame").evaluate((el) => el.style.transform);
  ok(/scale\(2\.5\)/.test(zoomed), "double-click zooms (" + zoomed + ")");
  await shot(page, "lightbox-zoom");
  await page.keyboard.press("Escape"); // resets zoom first
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  ok(await page.locator("dialog[open]").count() === 0, "Escape closes");
  ok(await page.evaluate(() => document.activeElement?.getAttribute("data-cursor")) === "view", "focus returns to the frame");
  await page.close();
}

// 2. Lightbox — touch swipe
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto(base + "/work/soccer", { waitUntil: "networkidle" });
  await page.locator("section:visible ul button").first().click();
  await page.waitForTimeout(800);
  await shot(page, "lightbox-mobile");
  const stage = page.locator("dialog[open] .touch-none");
  const box = await stage.boundingBox();
  await stage.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "touch", clientX: box.x + 300, clientY: box.y + 200, isPrimary: true });
  for (let x = 300; x >= 120; x -= 30) await stage.dispatchEvent("pointermove", { pointerId: 1, pointerType: "touch", clientX: box.x + x, clientY: box.y + 200 });
  await stage.dispatchEvent("pointerup", { pointerId: 1, pointerType: "touch", clientX: box.x + 120, clientY: box.y + 200 });
  await page.waitForTimeout(500);
  ok((await page.locator("dialog[open] .scoreboard").first().textContent()) === "02", "swipe left → next frame");
  await ctx.close();
}

// 3. Route transition curtain
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.locator("header nav a[href='/about']").click();
  await page.waitForTimeout(450);
  await shot(page, "curtain");
  const clip = await page.locator(".curtain").evaluate((el) => getComputedStyle(el).clipPath);
  ok(clip !== "inset(100% 0px 0px)", "curtain covers during navigation (" + clip + ")");
  await page.waitForURL("**/about", { timeout: 5000 });
  await page.waitForTimeout(1500);
  ok(page.url().endsWith("/about"), "navigates to /about");
  ok((await page.evaluate(() => window.scrollY)) === 0, "lands at top");
  await page.close();
}

// 4. Contact form states
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base + "/contact?for=" + encodeURIComponent("Team & media day"), { waitUntil: "networkidle" });
  ok(await page.locator("input[value='Team & media day']").isChecked(), "?for= prefills occasion");
  await page.getByRole("button", { name: /send it/i }).click();
  await page.waitForTimeout(1200);
  ok(await page.locator("#f-name-error").count() === 1, "empty submit shows field errors");
  ok(await page.evaluate(() => document.activeElement?.getAttribute("name")) === "name", "focus moves to first invalid field");
  await shot(page, "form-errors");
  await page.fill("#f-name", "Test Person");
  await page.fill("#f-email", "test@example.com");
  await page.fill("#f-message", "Senior night is coming up, want the whole team covered.");
  await page.getByRole("button", { name: /send it/i }).click();
  await page.waitForTimeout(1500);
  const alert = await page.locator("[role=alert], [role=status]").first().textContent();
  ok(/got away|Got it/.test(alert ?? ""), "submit resolves to a designed state: " + (alert ?? "").slice(0, 40));
  await shot(page, "form-result");
  await page.close();
}

// 5. Mobile menu
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /menu/i }).click();
  await page.waitForTimeout(1100);
  await shot(page, "mobile-menu");
  ok(await page.locator("#mobile-menu").getAttribute("aria-hidden") === "false", "mobile menu opens");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  ok(await page.locator("#mobile-menu").getAttribute("aria-hidden") === "true", "Escape closes menu");
  await ctx.close();
}

// 6. Reduced motion — content visible without animation
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(base + "/about", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const op = await page.locator("h1 .mask-line span").first().evaluate((el) => getComputedStyle(el).opacity);
  ok(op === "1", "headline visible with reduced motion");
  await ctx.close();
}

await browser.close();
