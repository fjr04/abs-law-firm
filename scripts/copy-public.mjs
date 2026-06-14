import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const from = path.join(root, "public");
const to = path.join(root, "dist");

if (!fs.existsSync(from)) {
  console.warn("public folder not found, skip copy.");
  process.exit(0);
}

fs.mkdirSync(to, { recursive: true });

for (const entry of fs.readdirSync(from)) {
  const src = path.join(from, entry);
  const dest = path.join(to, entry);
  fs.cpSync(src, dest, { recursive: true, force: true });
}
