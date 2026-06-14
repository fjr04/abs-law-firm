import fs from "node:fs";

fs.rmSync("dist", { recursive: true, force: true });
fs.mkdirSync("dist/assets/css", { recursive: true });
fs.mkdirSync("dist/assets/js", { recursive: true });
fs.mkdirSync("dist/assets/images", { recursive: true });
