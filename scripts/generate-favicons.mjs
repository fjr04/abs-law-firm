import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const input = path.join(root, 'public', 'assets', 'images', 'logo.png');
const out = path.join(root, 'public', 'assets', 'icons');
const bg = { r: 4, g: 11, b: 22, alpha: 1 };

await fs.mkdir(out, { recursive: true });

const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="108" fill="#040b16"/>
  <text x="50%" y="47%" text-anchor="middle" dominant-baseline="middle" font-family="Georgia, 'Times New Roman', serif" font-size="148" font-weight="700" fill="#C59B27">ABS</text>
  <text x="50%" y="65%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" letter-spacing="8" fill="#F9D976">LAW OFFICE</text>
</svg>`;

await fs.writeFile(path.join(out, 'favicon.svg'), fallbackSvg, 'utf8');

async function writeIconSet(source, label) {
  await source.clone().resize(512, 512, { fit: 'contain', background: bg }).png().toFile(path.join(out, 'favicon-512x512.png'));
  await source.clone().resize(192, 192, { fit: 'contain', background: bg }).png().toFile(path.join(out, 'android-chrome-192x192.png'));
  await source.clone().resize(180, 180, { fit: 'contain', background: bg }).png().toFile(path.join(out, 'apple-touch-icon.png'));
  await source.clone().resize(32, 32, { fit: 'contain', background: bg }).png().toFile(path.join(out, 'favicon-32x32.png'));
  await source.clone().resize(16, 16, { fit: 'contain', background: bg }).png().toFile(path.join(out, 'favicon-16x16.png'));
  console.log(`Favicons generated from ${label}`);
}

try {
  await fs.access(input);
  await writeIconSet(sharp(input).rotate(), 'public/assets/images/logo.png');
} catch (_) {
  await writeIconSet(sharp(Buffer.from(fallbackSvg)), 'SVG fallback');
}
