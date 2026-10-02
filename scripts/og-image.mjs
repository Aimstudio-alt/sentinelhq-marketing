// Renders public/og-image.png (1200x630) with Playwright. Run: npm run og-image
// Needs: npx playwright install chromium
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const font = (f) => `url(data:font/woff2;base64,${fs.readFileSync(path.join("public/fonts", f)).toString("base64")})`;
const products = [
  ["ClubSentinel", "#e8c547"],
  ["CountyConsent", "#e0609a"],
  ["SportConsent", "#8b6be0"],
  ["ReferenceSentinel", "#5b8be0"],
  ["CareSentinel", "#5aa874"],
];

const html = `<!doctype html><html><head><style>
@font-face{font-family:N;src:${font("newsreader-latin.woff2")};font-weight:200 800}
@font-face{font-family:H;src:${font("hanken-latin.woff2")};font-weight:100 900}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#f0f2e5;font-family:H;color:#1b1a16;position:relative;overflow:hidden}
.logo{position:absolute;left:80px;top:62px;display:flex;align-items:center;gap:20px;font:700 34px H}
.logo .m{width:80px;height:80px;border-radius:18px;background:#1b1a16;display:grid;place-items:center}
.logo span b{font-weight:700}.logo span i{font-style:normal;font-weight:400}
.eb{position:absolute;left:80px;top:232px;font:500 17px H;letter-spacing:.06em;color:#7a7a6e;text-transform:uppercase}
h1{position:absolute;left:80px;top:268px;width:640px;font:400 66px/1.08 N;letter-spacing:-.02em}
h1 u{text-decoration:none;border-bottom:5px solid #5aa874;padding-bottom:2px}
.sub{position:absolute;left:80px;top:516px;font:500 23px H;color:#6b6b60}
.row{position:absolute;left:80px;top:574px;display:flex;gap:26px;font:500 17px H;color:#4a4a42}
.row span{display:flex;align-items:center;gap:8px}.row i{width:11px;height:11px;border-radius:50%}
.c{position:absolute;border-radius:50%;mix-blend-mode:multiply;opacity:.8}
</style></head><body>
<div class="logo"><div class="m"><svg width="50" height="50" viewBox="0 0 32 32"><path d="M16 5l9 3.2v6c0 6.1-3.9 10.8-9 12.6-5.1-1.8-9-6.5-9-12.6v-6z" fill="none" stroke="#f0f2e5" stroke-width="2.1" stroke-linejoin="round"/><path d="M11.6 15.4l3 3 5.6-6" fill="none" stroke="#f0f2e5" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span><b>Sentinel</b><i>HQ</i></span></div>
<div class="eb">Compliance &amp; safeguarding software</div>
<h1>Built for UK golf clubs, sport, recruitment and <u>care.</u></h1>
<div class="sub">Golf · Junior sport · Recruitment · Care homes · UK-hosted</div>
<div class="row">${products.map(([n, c]) => `<span><i style="background:${c}"></i>${n}</span>`).join("")}</div>
<div class="c" style="left:932px;top:150px;width:165px;height:165px;background:#e8c547"></div>
<div class="c" style="left:1015px;top:218px;width:165px;height:165px;background:#e0609a"></div>
<div class="c" style="left:882px;top:264px;width:132px;height:132px;background:#8b6be0"></div>
<div class="c" style="left:930px;top:290px;width:165px;height:165px;background:#5b8be0"></div>
<div class="c" style="left:1030px;top:343px;width:144px;height:144px;background:#5aa874"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "public/og-image.png" });
await browser.close();
console.log("public/og-image.png written");
