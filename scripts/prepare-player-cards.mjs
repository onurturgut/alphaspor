import { readdir, access, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const source = "tasarim/oyuncu-kartlari";
const target = "public/media/academy/player-cards";
const files = (await readdir(source)).filter((file) => file.endsWith("-v1.png")).sort();
for (const file of files) {
  const output = `${target}/${file.replace(/\.png$/, ".webp")}`;
  const exists = await access(output).then(() => true, () => false);
  if (!exists) await sharp(`${source}/${file}`).webp({ quality: 90 }).toFile(output);
}
const modulePath = "src/lib/player-card-art.ts";
const moduleText = await readFile(modulePath, "utf8");
const names = files.map((file) => `  "${file.replace(/-v1\.png$/, "")}",`).join("\n");
await writeFile(modulePath, moduleText.replace(/const cardNames = new Set\(\[[\s\S]*?\]\);/, `const cardNames = new Set([\n${names}\n]);`));
console.log(`${files.length} player cards prepared and registered.`);
