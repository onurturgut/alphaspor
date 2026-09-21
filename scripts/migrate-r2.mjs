import nextEnv from "@next/env";
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { extname } from "node:path";
import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
const { getR2Client, getR2PublicUrl, checkR2Connection } =
  await import("../src/lib/r2.ts");
const { getDb, closeMongoClient } = await import("../src/lib/mongodb.ts");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const types = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
};

async function files(directory) {
  const entries = await readdir(new URL(directory, import.meta.url), {
    withFileTypes: true,
  });
  const result = [];
  for (const entry of entries) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) result.push(...(await files(path)));
    else if (entry.isFile() && types[extname(entry.name).toLowerCase()])
      result.push(path);
  }
  return result;
}

try {
  await checkR2Connection();
  getR2PublicUrl("media/check");
  const db = await getDb();
  const mapping = {};
  const paths = await files("../public/media");
  let count = 0;
  async function upload(path) {
    const body = await readFile(new URL(path, import.meta.url));
    const digest = hash(body);
    const relative = path.replace("../public/", "");
    const key = `media/${digest}/${relative.slice("media/".length)}`;
    const location = { Bucket: process.env.R2_BUCKET_NAME.trim(), Key: key };
    let exists = false;
    try {
      const head = await getR2Client().send(new HeadObjectCommand(location));
      exists =
        head.Metadata?.sha256 === digest && head.ContentLength === body.length;
      if (!exists) throw new Error("Object conflict");
    } catch (error) {
      if (error.$metadata?.httpStatusCode !== 404) throw error;
    }
    if (!exists)
      await getR2Client().send(
        new PutObjectCommand({
          ...location,
          Body: body,
          ContentType: types[extname(path).toLowerCase()],
          CacheControl: "public, max-age=31536000, immutable",
          Metadata: { sha256: digest },
          IfNoneMatch: "*",
        }),
      );
    const url = getR2PublicUrl(key);
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (
      !response.ok ||
      hash(Buffer.from(await response.arrayBuffer())) !== digest
    )
      throw new Error("Public content verification failed");
    mapping[`/${relative}`] = url;
    count++;
    if (count % 10 === 0 || count === paths.length)
      console.log(
        `R2: ${count}/${paths.length} görsel yüklendi ve public içerik hash'i doğrulandı.`,
      );
  }

  for (let offset = 0; offset < paths.length; offset += 4) {
    const results = await Promise.allSettled(
      paths.slice(offset, offset + 4).map(async (path) => {
        try {
          await upload(path);
        } catch (error) {
          console.error(
            `Dosya başarısız: ${path}; hata türü: ${error.name}; HTTP: ${error.$metadata?.httpStatusCode ?? "yok"}`,
          );
          throw error;
        }
      }),
    );
    if (results.some((result) => result.status === "rejected"))
      throw new Error("Upload batch failed");
  }

  // Only publish URLs after every upload and public download is verified.
  function replace(value) {
    if (typeof value === "string") return mapping[value] ?? value;
    if (Array.isArray(value)) return value.map(replace);
    if (
      value &&
      typeof value === "object" &&
      Object.getPrototypeOf(value) === Object.prototype
    )
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, replace(item)]),
      );
    return value;
  }
  const backups = [];
  const changes = [];
  for (const name of ["teams", "news", "staff", "settings", "matchSources"]) {
    for (const document of await db.collection(name).find({}).toArray()) {
      const fields = {};
      const previous = {};
      for (const [key, value] of Object.entries(document)) {
        if (key === "_id") continue;
        const next = replace(value);
        if (JSON.stringify(next) !== JSON.stringify(value)) {
          fields[key] = next;
          previous[key] = value;
        }
      }
      if (Object.keys(fields).length) {
        backups.push({ collection: name, id: document._id, fields: previous });
        changes.push({ name, id: document._id, fields, previous });
      }
    }
  }
  await mkdir(new URL("../.local-backups/", import.meta.url), {
    recursive: true,
  });
  await writeFile(
    new URL(`../.local-backups/r2-${Date.now()}.json`, import.meta.url),
    JSON.stringify(backups, null, 2),
  );
  for (const change of changes) {
    const result = await db
      .collection(change.name)
      .updateOne(
        { _id: change.id, ...change.previous },
        { $set: change.fields },
      );
    if (result.matchedCount !== 1)
      throw new Error("Concurrent content change; retry migration");
  }
  await writeFile(
    new URL("../src/data/r2-media.json", import.meta.url),
    JSON.stringify(mapping, null, 2) + "\n",
  );
  console.log(
    `Tamamlandı: ${count} görsel doğrulandı; ${changes.length} MongoDB belgesinin görsel adresi güncellendi.`,
  );
} catch {
  console.error(
    "R2 aktarımı tamamlanamadı. Bağlantı, public erişim ve yazma izinlerini kontrol edin. Yerel dosyalar korunuyor; komut tekrar çalıştırılabilir.",
  );
  process.exitCode = 1;
} finally {
  await closeMongoClient();
  try {
    getR2Client().destroy();
  } catch {
    /* Unconfigured client. */
  }
}
