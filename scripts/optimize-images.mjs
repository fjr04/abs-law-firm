import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const imageRoot = path.join(root, "dist", "assets", "images");

const allowed = new Set([".jpg", ".jpeg", ".png"]);

async function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const res = path.join(dir, entry.name);
    return entry.isDirectory() ? await walk(res) : res;
  }));
  return files.flat();
}

function imageOptions(file) {
  const normalized = file.replaceAll(path.sep, "/");
  if (normalized.includes("/activity-")) return { width: 900, quality: 76 };
  if (normalized.includes("/team-")) return { width: 480, quality: 78 };
  if (normalized.endsWith("/logo.png")) return { width: 360, quality: 82 };
  if (normalized.endsWith("/hero.jpg") || normalized.endsWith("/hero.jpeg") || normalized.endsWith("/hero.png")) return { width: 1600, quality: 78 };
  return { width: 1000, quality: 78 };
}

const files = await walk(imageRoot);

for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  if (!allowed.has(ext)) continue;

  const { width, quality } = imageOptions(file);
  const parsed = path.parse(file);
  const webp = path.join(parsed.dir, `${parsed.name}.webp`);
  const avif = path.join(parsed.dir, `${parsed.name}.avif`);

  try {
    const image = sharp(file).rotate().resize({ width, withoutEnlargement: true });
    await image.clone().webp({ quality }).toFile(webp);
    await image.clone().avif({ quality: Math.max(45, quality - 20), effort: 4 }).toFile(avif);
    console.log(`Optimized: ${path.relative(root, file)}`);
  } catch (err) {
    console.warn(`Could not optimize ${file}: ${err.message}`);
  }
}
