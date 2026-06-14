import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const htmlPath = path.join(root, "dist", "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

function existsInDist(src) {
  return fs.existsSync(path.join(root, "dist", src.replace(/^\/+/, "")));
}

function withWebpSrcset(tag) {
  const srcMatch = tag.match(/\ssrc="([^"]+)"/);
  if (!srcMatch) return tag;

  const src = srcMatch[1];
  if (!src.startsWith("assets/images/")) return tag;
  if (!/\.(jpg|jpeg|png)$/i.test(src)) return tag;
  if (tag.includes("srcset=")) return tag;

  const webp = src.replace(/\.(jpg|jpeg|png)$/i, ".webp");
  if (!existsInDist(webp)) return tag;

  return tag.replace(/\ssrc="/, ` srcset="${webp}" src="`);
}

html = html.replace(/<img\b[^>]*>/g, withWebpSrcset);

// If local hero optimized image exists, use it. If not, keep source path as-is.
if (existsInDist("assets/images/hero.avif")) {
  html = html.replace(
    /style="background-image:\s*url\('assets\/images\/hero\.jpg'\);"/,
    `style="background-image: image-set(url('assets/images/hero.avif') type('image/avif'), url('assets/images/hero.webp') type('image/webp'), url('assets/images/hero.jpg') type('image/jpeg'));"` 
  );
  html = html.replace(
    /<link rel="preload" href="assets\/images\/hero\.jpg" as="image" fetchpriority="high">/,
    `<link rel="preload" href="assets/images/hero.avif" as="image" fetchpriority="high">`
  );
}

fs.writeFileSync(htmlPath, html);
