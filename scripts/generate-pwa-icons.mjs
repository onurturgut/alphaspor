import sharp from "sharp";
import { mkdir } from "node:fs/promises";

await mkdir("public/icons", { recursive: true });
for (const [name, size, inset] of [
  ["icon-192.png", 192, 24],
  ["icon-512.png", 512, 64],
  ["icon-maskable-512.png", 512, 96],
  ["apple-touch-icon.png", 180, 24],
]) {
  const logo = await sharp("public/media/logo.png")
    .resize(size - inset * 2, size - inset * 2, { fit: "contain", background: "#f4f4f4" })
    .png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 3, background: "#f4f4f4" } })
    .composite([{ input: logo, gravity: "center" }]).png().toFile(`public/icons/${name}`);
}
console.log("PWA icons generated from the existing club crest.");
