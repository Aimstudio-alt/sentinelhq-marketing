// Full-page screenshots of every page at desktop and mobile width.
// Usage: node scripts/screenshots.mjs <baseUrl> <outDir> [--js-off]
// SHOT_COOKIE="name=value" adds a cookie (e.g. Vercel preview auth).
import fs from "node:fs";
import { chromium } from "playwright";

const [base, outDir = "shots", flag] = process.argv.slice(2);
const pages = ["/", "/clubsentinel/", "/countyconsent/", "/referencesentinel/", "/caresentinel/", "/legal.html"];
const sizes = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
for (const [label, viewport] of Object.entries(sizes)) {
  const ctx = await browser.newContext({
    viewport, deviceScaleFactor: 1, javaScriptEnabled: flag !== "--js-off",
    isMobile: label === "mobile", hasTouch: label === "mobile", reducedMotion: "reduce",
  });
  if (process.env.SHOT_COOKIE) {
    const [name, ...v] = process.env.SHOT_COOKIE.split("=");
    await ctx.addCookies([{ name, value: v.join("="), url: base }]);
  }
  for (const p of pages) {
    const page = await ctx.newPage();
    await page.goto(base.replace(/\/$/, "") + p, { waitUntil: "networkidle", timeout: 60000 });
    // trigger lazy images + reveal animations, then return to top
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
    const name = (p === "/" ? "home" : p.replace(/\/|\.html/g, "")) + `-${label}.png`;
    await page.screenshot({ path: `${outDir}/${name.replace(/\.png$/, ".jpg")}`, fullPage: true, type: "jpeg", quality: 72 });
    await page.close();
    console.log(`${outDir}/${name}`);
  }
  await ctx.close();
}
await browser.close();
