import nextEnv from "@next/env";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
const { getR2Client, getR2PublicUrl } = await import("../src/lib/r2.ts");
const { getDb, closeMongoClient } = await import("../src/lib/mongodb.ts");
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

try {
  const assets = {};
  for (const [field, file, contentType] of [
    ["desktop", "desktop.mp4", "video/mp4"],
    ["mobile", "mobile.mp4", "video/mp4"],
    ["poster", "poster.jpg", "image/jpeg"],
    ["mobilePoster", "mobile-poster.jpg", "image/jpeg"],
  ]) {
    const body = await readFile(
      new URL(`../.local-backups/hero-video/${file}`, import.meta.url),
    );
    const sha256 = digest(body);
    const key = `media/hero-video/${sha256}/${file}`;
    const location = { Bucket: process.env.R2_BUCKET_NAME.trim(), Key: key };
    let exists = false;
    try {
      const head = await getR2Client().send(new HeadObjectCommand(location));
      exists =
        head.Metadata?.sha256 === sha256 && head.ContentLength === body.length;
      if (!exists) throw new Error("Existing object mismatch");
    } catch (error) {
      if (error.$metadata?.httpStatusCode !== 404) throw error;
    }
    if (!exists)
      await getR2Client().send(
        new PutObjectCommand({
          ...location,
          Body: body,
          ContentType: contentType,
          Metadata: { sha256 },
          IfNoneMatch: "*",
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
    const url = getR2PublicUrl(key);
    const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
    if (
      !response.ok ||
      digest(Buffer.from(await response.arrayBuffer())) !== sha256
    )
      throw new Error("Public verification failed");
    if (contentType === "video/mp4") {
      const range = await fetch(url, {
        headers: { Range: "bytes=0-1023" },
        signal: AbortSignal.timeout(30000),
      });
      const bytes = Buffer.from(await range.arrayBuffer());
      if (range.status !== 206 || !bytes.equals(body.subarray(0, 1024)))
        throw new Error("Video range requests failed");
    }
    assets[field] = url;
    console.log(
      `${file}: ${(body.length / 1024 / 1024).toFixed(2)} MB; public içerik ve video akış erişimi doğrulandı.`,
    );
  }
  const db = await getDb();
  const settings = db.collection("settings");
  const previous = await settings.findOne({ _id: "club" });
  if (!previous) throw new Error("Club settings missing");
  await writeFile(
    new URL(
      `../.local-backups/hero-video/before-${Date.now()}.json`,
      import.meta.url,
    ),
    JSON.stringify({ heroVideo: previous.heroVideo ?? null }, null, 2),
  );
  const result = await settings.updateOne(
    { _id: "club", heroVideo: previous.heroVideo ?? { $exists: false } },
    { $set: { heroVideo: assets } },
  );
  if (result.matchedCount !== 1)
    throw new Error("Settings changed concurrently");
  console.log("Hero video adresleri MongoDB'ye kaydedildi.");
} catch {
  console.error(
    "Hero video yayını tamamlanamadı. Dosyalar ve bağlantı kontrol edilmeli; komut yeniden çalıştırılabilir.",
  );
  process.exitCode = 1;
} finally {
  await closeMongoClient();
  try {
    getR2Client().destroy();
  } catch {
    /* No client created. */
  }
}
