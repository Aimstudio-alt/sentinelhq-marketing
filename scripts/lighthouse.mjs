// Lighthouse (mobile, default throttling) for every page.
//
//   node scripts/lighthouse.mjs <baseUrl> [--cookie "<name=value>"] [--map <ip>] [--pages /,/a/]
//
// --map <ip> resolves the base URL's host to <ip> inside Chrome only (no DNS
// change), e.g. --map 76.76.21.21 to test sentinelhq.co.uk on Vercel before
// the DNS switch. Requests are checked so a wrong origin can't slip through.
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const args = process.argv.slice(2);
const base = args[0].replace(/\/$/, "");
const opt = (k) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : undefined; };
const cookie = opt("--cookie");
const map = opt("--map");
const pages = (opt("--pages") || "/,/clubsentinel/,/countyconsent/,/referencesentinel/,/caresentinel/,/legal.html").split(",");

const chromeFlags = ["--headless=new", "--no-sandbox"];
if (map) chromeFlags.push(`--host-resolver-rules=MAP ${new URL(base).hostname} ${map}`, "--ignore-certificate-errors");

const pct = (c) => String(Math.round((c?.score ?? 0) * 100)).padStart(4);
console.log("page".padEnd(22), "perf  seo  a11y   bp     LCP     TBT     CLS  failed SEO audits");
for (const p of pages) {
  // Fresh browser per page: a shared session can lose the preview auth cookie.
  const chrome = await chromeLauncher.launch({
    chromePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe",
    chromeFlags,
  });
  const { lhr } = await lighthouse(base + p, {
    port: chrome.port, output: "json", logLevel: "error",
    onlyCategories: ["performance", "seo", "accessibility", "best-practices"],
    extraHeaders: cookie ? { Cookie: cookie } : undefined,
  });
  await chrome.kill();
  if (lhr.runtimeError) { console.log(p.padEnd(22), "ERROR", lhr.runtimeError.code); continue; }
  const a = lhr.audits;
  // Guard against measuring the wrong server (the old LiteSpeed bundle used blob: scripts).
  const blob = (a["network-requests"].details.items || []).some((i) => i.url.startsWith("blob:"));
  const failed = lhr.categories.seo.auditRefs.map((x) => a[x.id]).filter((x) => x.score === 0).map((x) => x.id).join(", ");
  console.log(p.padEnd(22), pct(lhr.categories.performance), pct(lhr.categories.seo), pct(lhr.categories.accessibility),
    pct(lhr.categories["best-practices"]), a["largest-contentful-paint"].displayValue.padStart(7),
    a["total-blocking-time"].displayValue.padStart(7), a["cumulative-layout-shift"].displayValue.padStart(7),
    " " + (failed || "-"), blob ? "  !! OLD SITE (blob: scripts)" : "");
}
