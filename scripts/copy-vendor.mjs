import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFileSafe(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`Missing optional file: ${src}`);
    return;
  }
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyDirSafe(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`Missing optional directory: ${src}`);
    return;
  }
  ensureDir(path.dirname(dest));
  fs.cpSync(src, dest, { recursive: true });
}

const fontDir = path.join(dist, "assets", "fonts");

const fonts = [
  ["@fontsource/poppins/files/poppins-latin-300-normal.woff2", "poppins-300.woff2"],
  ["@fontsource/poppins/files/poppins-latin-400-normal.woff2", "poppins-400.woff2"],
  ["@fontsource/poppins/files/poppins-latin-500-normal.woff2", "poppins-500.woff2"],
  ["@fontsource/poppins/files/poppins-latin-600-normal.woff2", "poppins-600.woff2"],
  ["@fontsource/poppins/files/poppins-latin-700-normal.woff2", "poppins-700.woff2"],
  ["@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff2", "playfair-400.woff2"],
  ["@fontsource/playfair-display/files/playfair-display-latin-400-italic.woff2", "playfair-400-italic.woff2"],
  ["@fontsource/playfair-display/files/playfair-display-latin-600-normal.woff2", "playfair-600.woff2"],
  ["@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff2", "playfair-700.woff2"]
];

for (const [src, dest] of fonts) {
  copyFileSafe(
    path.join(root, "node_modules", src),
    path.join(fontDir, dest)
  );
}

