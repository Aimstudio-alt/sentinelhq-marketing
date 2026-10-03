// Renders public/og-image.png (1200x630) in the SentinelHQ redesign palette with Playwright.
// Run: npm run og-image   (needs: npx playwright install chromium)
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const font = (f) => `url(data:font/woff2;base64,${fs.readFileSync(path.join("public/fonts", f)).toString("base64")})`;
const products = [
  ["ClubSentinel", "#c99418"],
  ["CountyConsent", "#2f9a63"],
  ["SportConsent", "#8b74e6"],
  ["ReferenceSentinel", "#5b86e0"],
  ["CareSentinel", "#3fb0b0"],
];
const shield = (size, stroke) => `<svg width="${size}" height="${size}" viewBox="0 0 28 28" fill="none"><path d="M14 2.5l9.5 3.4v6.6c0 5.9-3.7 10.4-9.5 13-5.8-2.6-9.5-7.1-9.5-13V5.9z" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/><path d="M9.6 13.4l3 3 5.8-6.2" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const html = `<!doctype html><html><head><style>
@font-face{font-family:SrcSerif;src:${font("sourceserif4-latin.woff2")};font-weight:500 600}
@font-face{font-family:Sans;src:${font("publicsans-latin.woff2")};font-weight:400 700}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#0e2219;color:#eef1e8;font-family:Sans;position:relative;overflow:hidden}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:48px 48px}
.logo{position:absolute;left:80px;top:64px;display:flex;align-items:center;gap:14px;font:500 34px/1 Sans;letter-spacing:-.02em;color:#fff}
.logo b{font-weight:700}
.eb{position:absolute;left:80px;top:196px;font:700 17px/1 Sans;letter-spacing:.12em;text-transform:uppercase;color:#8fd0a8}
h1{position:absolute;left:80px;top:232px;width:740px;font:600 64px/1.06 SrcSerif;letter-spacing:-.022em;color:#fff}
.sub{position:absolute;left:80px;top:474px;font:500 22px/1.3 Sans;color:#b9c4bb}
.row{position:absolute;left:80px;right:80px;bottom:52px;display:flex;gap:28px;font:600 17px/1 Sans;color:#eef1e8;padding-top:22px;border-top:1px solid rgba(255,255,255,.12)}
.row span{display:flex;align-items:center;gap:9px}.row i{width:11px;height:11px;border-radius:3px}
.card{position:absolute;right:80px;top:200px;width:236px;background:#163327;border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:22px}
.card .h{display:flex;justify-content:space-between;align-items:center;font:700 13px/1 Sans;color:#b9c4bb;letter-spacing:.06em}
.card .n{font:600 64px/1 SrcSerif;color:#fff;margin-top:16px;letter-spacing:-.02em}.card .n small{font:500 18px Sans;color:#b9c4bb;margin-left:6px;letter-spacing:0}
.chip{display:inline-block;margin-top:14px;font:700 12px/1 Sans;letter-spacing:.06em;padding:7px 9px;border-radius:5px;background:#e2f1e7;color:#1d6a43}
.bar{height:6px;border-radius:3px;background:rgba(255,255,255,.1);margin-top:18px;overflow:hidden}.bar i{display:block;height:100%;width:84%;background:#8fd0a8}
</style></head><body>
<div class="grid"></div>
<div class="logo">${shield(42, "#fff")}<span><b>Sentinel</b>HQ</span></div>
<div class="eb">Compliance &amp; safeguarding software</div>
<h1>Compliance and safeguarding records that stand up to scrutiny.</h1>
<div class="sub">Golf clubs · Junior sport · Recruitment · Care homes · UK-hosted</div>
<div class="card"><div class="h"><span>COMPLIANCE</span><span>LIVE</span></div><div class="n">84<small>/ 100</small></div><span class="chip">AUDIT READY</span><div class="bar"><i></i></div></div>
<div class="row">${products.map(([n, c]) => `<span><i style="background:${c}"></i>${n}</span>`).join("")}</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "public/og-image.png" });
await browser.close();
console.log("public/og-image.png written");
