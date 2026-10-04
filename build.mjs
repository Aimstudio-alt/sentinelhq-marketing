// build.mjs: static build for sentinelhq.co.uk.
//
//   src/home/*.jsx        homepage, pre-rendered to HTML with React SSR; the booking
//                         calendar ships as a small Preact island (assets/home-*.js)
//   src/<page>/index.html product pages, src/legal.html: hand-written HTML
//   src/site.mjs          per-page SEO, JSON-LD, footer data
//   public/               copied as-is
//
// Every page gets a generated <head> (title, description, canonical, OG/Twitter,
// icons, self-hosted fonts, JSON-LD), the shared footer details and optimised images.
// Output: dist/

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import * as esbuild from "esbuild";
import sharp from "sharp";
import { PAGES, SITE_URL, LASTMOD, REGISTERED_OFFICE, FOOTER_PRODUCTS, LINKEDIN } from "./src/site.mjs";

const SRC = "src";
const OUT = "dist";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escText = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const decode = (s) =>
  s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&#x27;|&rsquo;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

const warnings = [];

// ── 0. clean + copy public ───────────────────────────────────────────────────
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync("public", OUT, { recursive: true });

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\n\s*\n/g, "\n").trim();
const FONTS_CSS = stripComments(fs.readFileSync(`${SRC}/fonts.css`, "utf8"));
const SHARED_CSS = stripComments(fs.readFileSync(`${SRC}/shared.css`, "utf8"));
const LEGAL_CSS = stripComments(fs.readFileSync(`${SRC}/legal-redesign.css`, "utf8"));

// ── 1. head ──────────────────────────────────────────────────────────────────
function headBlock(page, { themeColor = "#0e2219", jsonLd }) {
  const url = SITE_URL + page.path;
  const og = `${SITE_URL}/og-image.png`;
  for (const [k, max] of [["title", 60], ["description", 155]]) {
    if (page[k].length > max) warnings.push(`${page.path}: ${k} is ${page[k].length} chars (max ${max})`);
  }
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escText(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="${themeColor}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="SentinelHQ">
<meta property="og:locale" content="en_GB">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${og}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(page.ogAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${og}">
<meta name="twitter:image:alt" content="${esc(page.ogAlt)}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/publicsans-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/sourceserif4-latin.woff2" as="font" type="font/woff2" crossorigin>
<style>${FONTS_CSS}
${SHARED_CSS}</style>
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": jsonLd }).replace(/</g, "\\u003c")}</script>`;
}

// Tags in a hand-written <head> that the generated block replaces.
const STRIP_HEAD = [
  /<meta charset[^>]*>\s*/gi,
  /<meta name="(viewport|description|keywords|author|robots|theme-color)"[^>]*>\s*/gi,
  /<meta property="og:[^"]*"[^>]*>\s*/gi,
  /<meta name="twitter:[^"]*"[^>]*>\s*/gi,
  /<title>[\s\S]*?<\/title>\s*/gi,
  /<link rel="(canonical|icon|apple-touch-icon|preconnect)"[^>]*>\s*/gi,
  /<link[^>]*fonts\.googleapis\.com[^>]*>\s*/gi,
  /<noscript>\s*<link[^>]*fonts\.googleapis\.com[^>]*>\s*<\/noscript>\s*/gi,
  /<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi,
  /<!--[\s\S]*?-->\s*/g,
];

function faqSchema(html, pagePath) {
  const qs = [...html.matchAll(/<details[^>]*>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)];
  if (!qs.length) return null;
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}${pagePath}#faq`,
    mainEntity: qs.map(([, q, a]) => ({
      "@type": "Question",
      name: decode(q),
      acceptedAnswer: { "@type": "Answer", text: decode(a) },
    })),
  };
}

// ── 2. images: resize to webp, add width/height ─────────────────────────────
const MAX_W = 1200;
async function processImages(html, pageDir) {
  const tags = [...html.matchAll(/<img\b[^>]*\bsrc="img\/([^"]+)"[^>]*>/g)];
  for (const [tag, file] of tags) {
    const srcFile = path.join(SRC, pageDir, "img", file);
    const outName = file.replace(/\.(jpe?g|png)$/i, ".webp");
    const outFile = path.join(OUT, pageDir, "img", outName);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    const info = await sharp(srcFile).rotate().resize({ width: MAX_W, withoutEnlargement: true })
      .webp({ quality: 70, effort: 6 }).toFile(outFile);
    if (!/\balt="[^"]+"/.test(tag)) warnings.push(`${pageDir}/${file}: missing alt text`);
    let next = tag.replace(`src="img/${file}"`, `src="img/${outName}" width="${info.width}" height="${info.height}"`)
      .replace(/\s(width|height)="\d+"(?=[^>]*\s\1=)/g, "");
    if (!/decoding=/.test(next)) next = next.replace(/\s*\/?>$/, ' decoding="async">');
    html = html.replace(tag, next);
  }
  return html;
}

// ── 3. shared nav + footer (every page) ─────────────────────────────────────
const SHIELD = (size) => `<svg viewBox="0 0 28 28" width="${size}" height="${size}" fill="none" aria-hidden="true"><path d="M14 2.5l9.5 3.4v6.6c0 5.9-3.7 10.4-9.5 13-5.8-2.6-9.5-7.1-9.5-13V5.9z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9.6 13.4l3 3 5.8-6.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const HOME_LINKS = [["How it works", "#how"], ["Products", "#products"], ["Customers", "#customers"], ["About", "#about"]];

function navHTML({ links, cta, sub = "", skip = false }) {
  const [label, href, ext] = cta;
  const extAttr = ext ? ' target="_blank" rel="noopener"' : "";
  return `${skip ? '<a class="sh-skip" href="#main">Skip to content</a>\n' : ""}<nav class="sh-top" aria-label="Main"><div class="sh-w">
 <a class="sh-brand" href="/">${SHIELD(30)}<span><b>Sentinel</b>HQ</span>${sub ? `<small>${sub}</small>` : ""}</a>
 <ul class="sh-links">${links.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
 <div class="sh-nr"><a class="sh-btn sh-btn-p" href="${href}"${extAttr}>${label}</a></div>
</div></nav>`;
}

const LEGAL_LINE = `© 2026 ${escText(REGISTERED_OFFICE)} UK hosted · Built in North East England.`;
function footerHTML() {
  const prods = FOOTER_PRODUCTS.map(([n, h, ext]) => `<li><a href="${h}"${ext ? ' target="_blank" rel="noopener"' : ""}>${n}${ext ? " ↗" : ""}</a></li>`).join("");
  return `<footer class="sh-foot"><div class="sh-w">
 <div><a class="sh-brand" href="/">${SHIELD(26)}<span><b>Sentinel</b>HQ</span></a><p>Compliance and safeguarding software for golf clubs, county unions, junior sport, recruitment agencies and care homes.</p><p><a href="mailto:hello@sentinelhq.co.uk">hello@sentinelhq.co.uk</a><br><a href="${LINKEDIN}" target="_blank" rel="noopener">LinkedIn</a></p></div>
 <div><h2>Products</h2><ul>${prods}</ul></div>
 <div><h2>Trust</h2><ul><li><a href="/legal.html#privacy">Privacy</a></li><li><a href="/legal.html#security">Security</a></li><li><a href="/legal.html#terms">Terms</a></li><li><a href="/legal.html#dpa">DPA</a></li></ul></div>
 <p class="sh-legal">${LEGAL_LINE}</p>
</div></footer>`;
}

// Make in-page links to this site root-relative. Body only: canonical and
// og:url in the head must stay absolute.
function absolutiseSiteLinks(html) {
  const i = html.indexOf("<body");
  return html.slice(0, i) + html.slice(i).replace(/href="https:\/\/sentinelhq\.co\.uk\//g, 'href="/');
}

// ── 4. hand-written pages ────────────────────────────────────────────────────
for (const page of PAGES.filter((p) => p.src !== "home")) {
  let html = fs.readFileSync(path.join(SRC, page.src), "utf8");
  const pageDir = path.dirname(page.src) === "." ? "" : path.dirname(page.src);
  const [, head] = html.match(/<head>([\s\S]*?)<\/head>/);
  let rest = head;
  for (const re of STRIP_HEAD) rest = rest.replace(re, "");
  const faq = faqSchema(html, page.path);
  const jsonLd = page.schema(faq).filter(Boolean);
  html = html.replace(head, `\n${headBlock(page, { jsonLd })}\n${rest.trim()}\n`);
  html = html.replace(/<html lang="en">/, '<html lang="en-GB">');

  // legal.html: shared nav and footer plus its redesign layer
  {
    html = html.replace("<body>", `<body>\n${navHTML({ links: HOME_LINKS.map(([t, h]) => [t, "/" + h]), cta: ["Book a call", "/#book"] })}`);
    const i = html.lastIndexOf("<script>");
    html = html.slice(0, i) + footerHTML() + "\n\n" + html.slice(i);
    html = html.replace("</head>", `<style>${LEGAL_CSS}</style>\n</head>`);
  }
  html = absolutiseSiteLinks(html);
  html = await processImages(html, pageDir);

  const out = path.join(OUT, page.src);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}

// Scroll-triggered motion from the design reference: How it works plays once .steps is in view;
// each product card plays when its record card is 60% visible (clear of the bottom 25%) and
// resets only once fully off screen (one observer to play, one to reset).
const HOME_MOTION_JS = `(function(){var s=document.querySelector('.steps');if(!s)return;if(!('IntersectionObserver' in window)){s.classList.add('in');return}
var o=new IntersectionObserver(function(e){if(e[0].isIntersecting){s.classList.add('in');o.disconnect()}},{threshold:.2});o.observe(s)})();
(function(){var us=document.querySelectorAll('.prod .ui');function on(u,v){u.closest('.prod').classList.toggle('in',v)}
if(!('IntersectionObserver' in window)){us.forEach(function(u){on(u,true)});return}
var play=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)on(e.target,true)})},{rootMargin:'0px 0px -25% 0px',threshold:.6});
var reset=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)on(e.target,false)})},{threshold:0});
us.forEach(function(u){play.observe(u);reset.observe(u)})})();`;

// ── 5. homepage: SSR + client island ─────────────────────────────────────────
{
  const page = PAGES.find((p) => p.src === "home");
  const tmp = path.join("node_modules", ".cache", "shq");
  fs.mkdirSync(tmp, { recursive: true });

  // server render
  const ssrFile = path.join(tmp, "ssr.mjs");
  await esbuild.build({
    entryPoints: ["src/home/ssr-entry.jsx"],
    bundle: true, platform: "node", format: "esm", outfile: ssrFile,
    external: ["react", "react-dom"], logLevel: "warning",
  });
  const { renderDemo, renderBooking } = await import(pathToFileURL(path.resolve(ssrFile)).href + `?t=${Date.now()}`);

  // client islands (Preact via the React compat layer)
  const client = await esbuild.build({
    entryPoints: ["src/home/client.jsx"],
    bundle: true, minify: true, format: "esm", target: "es2019", write: false,
    alias: { react: "preact/compat", "react-dom": "preact/compat", "react/jsx-runtime": "preact/jsx-runtime" },
    define: { "process.env.NODE_ENV": '"production"' }, logLevel: "warning",
  });
  const js = client.outputFiles[0].contents;
  const hash = crypto.createHash("sha256").update(js).digest("hex").slice(0, 10);
  fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });
  fs.writeFileSync(path.join(OUT, "assets", `home-${hash}.js`), js);

  const body = fs.readFileSync("src/home/index.html", "utf8")
    .replace("<!--#nav-->", navHTML({ links: HOME_LINKS, cta: ["Book a call", "#book"], skip: true }))
    .replace("<!--#footer-->", footerHTML())
    .replace("<!--#demo-->", renderDemo())
    .replace("<!--#booking-->", renderBooking());
  const css = stripComments(fs.readFileSync("src/home/home.css", "utf8"));
  const html = `<!DOCTYPE html>
<html lang="en-GB">
<head>
<script>document.documentElement.classList.add("js")</script>
${headBlock(page, { jsonLd: page.schema() })}
<style>${css}</style>
</head>
<body>
${body}
<script>${HOME_MOTION_JS}</script>
<script type="module" src="/assets/home-${hash}.js"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(OUT, "index.html"), html);
}

// ── 6. sitemap ───────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map((p) => `  <url>\n    <loc>${SITE_URL}${p.path}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n  </url>`).join("\n")}
</urlset>
`);

// ── 7. checks ────────────────────────────────────────────────────────────────
for (const f of fs.readdirSync(OUT, { recursive: true }).filter((f) => String(f).endsWith(".html"))) {
  const html = fs.readFileSync(path.join(OUT, f), "utf8");
  const h1 = (html.match(/<h1\b/g) || []).length;
  if (h1 !== 1) warnings.push(`${f}: ${h1} <h1> elements`);
  if (/text\/babel/.test(html)) warnings.push(`${f}: still contains text/babel`);
  if (/\[PLACEHOLDER/.test(html)) warnings.push(`${f}: contains a [PLACEHOLDER] (Ray Tatters testimonial)`);
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, " ");
  const dashes = (text.match(/\u2014/g) || []).length;
  if (dashes) warnings.push(`${f}: ${dashes} em dash(es) in visible text`);
  const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
  console.log(`  ${f.padEnd(32)} ${kb} KB`);
}
if (warnings.length) console.warn("\nWarnings:\n  " + warnings.join("\n  "));
console.log("\nBuilt to dist/");
