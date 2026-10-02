// Generates favicon.ico, favicon-32.png, apple-touch-icon.png and icon-512.png
// in public/ from the SentinelHQ shield mark. Run: npm run icons
import fs from "node:fs";
import sharp from "sharp";

const mark = (rx) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="${rx}" fill="#1b1a16"/>
  <path d="M16 5l9 3.2v6c0 6.1-3.9 10.8-9 12.6-5.1-1.8-9-6.5-9-12.6v-6z" fill="none" stroke="#f0f2e5" stroke-width="2.1" stroke-linejoin="round"/>
  <path d="M11.6 15.4l3 3 5.6-6" fill="none" stroke="#f0f2e5" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const png = (size, rx = 7) => sharp(Buffer.from(mark(rx)), { density: 72 * (size / 32) * 2 }).resize(size, size).png().toBuffer();

// ICO container holding PNG images (supported by every current browser).
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = 6 + dir.length;
  images.forEach(({ size, buf }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o); dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt8(0, o + 2); dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4); dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(buf.length, o + 8); dir.writeUInt32LE(offset, o + 12);
    offset += buf.length;
  });
  return Buffer.concat([header, dir, ...images.map((i) => i.buf)]);
}

const sizes = [16, 32, 48];
const icoImages = await Promise.all(sizes.map(async (size) => ({ size, buf: await png(size) })));
fs.writeFileSync("public/favicon.ico", ico(icoImages));
fs.writeFileSync("public/favicon-32.png", await png(32));
// iOS applies its own corner mask, so the touch icon is a full square.
fs.writeFileSync("public/apple-touch-icon.png", await png(180, 0));
fs.writeFileSync("public/icon-512.png", await png(512));
console.log("icons written to public/");
