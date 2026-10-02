import assert from "node:assert/strict";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import nextEnv from "@next/env";
import sharp from "sharp";
import { schemas, slugify } from "../src/lib/admin/schema.ts";

nextEnv.loadEnvConfig(process.cwd(), true);
const { getDb, closeMongoClient } = await import("../src/lib/mongodb.ts");
const { getR2Client, deleteR2Object } = await import("../src/lib/r2.ts");
const base = process.argv[2] || "http://127.0.0.1:3000";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname));
const suffix = randomUUID();
const id = `upload-verify-${suffix}`;
const slug = `u-15-${suffix}`;
const token = randomBytes(32).toString("hex");
const db = await getDb();
let uploadedKey;
const headers = { Cookie: `alpha_admin=${token}`, Origin: base };
const save = (data, recordId = null, version = null) => fetch(`${base}/api/admin/data/teams`, {
  method: "PUT", headers: { ...headers, "Content-Type": "application/json" },
  body: JSON.stringify({ id: recordId, version, data }),
});
try {
  assert.equal(slugify("U-15"), "u-15");
  assert.equal(slugify("İĞDIR Şampiyon Çocukları"), "igdir-sampiyon-cocuklari");
  const data = { slug: slug.toUpperCase(), name: "Verification U-15", season: "2026/2027", photo: "/media/logo.webp", photoAlt: "", players: [], order: 9999 };
  assert.equal(schemas.teams.parse(data).slug, slug);
  assert.equal(schemas.teams.safeParse({ ...data, slug: "---" }).success, false);
  assert.equal(schemas.teams.safeParse({ ...data, slug: "x".repeat(81) }).success, false);
  console.log("PASS: uppercase and Turkish slug normalization, invalid slug rejection");

  await db.collection("adminUsers").insertOne({ _id: id, email: `${id}@example.com`, active: true, role: "editor" });
  await db.collection("adminSessions").insertOne({ _id: createHash("sha256").update(token).digest("hex"), userId: id, expiresAt: new Date(Date.now() + 600000) });
  const png = await sharp({ create: { width: 24, height: 24, channels: 3, background: "#123456" } }).png().toBuffer();
  const form = new FormData();
  form.append("file", new Blob([png], { type: "image/png" }), "verify.png");
  form.append("preset", "landscape");
  const upload = await fetch(`${base}/api/admin/upload`, { method: "POST", headers, body: form });
  assert.equal(upload.status, 200);
  const media = await upload.json();
  assert.match(media.url, /^\/api\/media\/media\/admin\/[a-f0-9-]+\.webp$/);
  uploadedKey = media.url.replace(/^\/api\/media\//, "");
  assert.equal(media.width, 1600);
  assert.equal(media.height, 900);
  const image = await fetch(new URL(media.url, base));
  assert.equal(image.status, 200);
  assert.match(image.headers.get("content-type"), /^image\/webp/);
  assert.match(image.headers.get("cache-control"), /immutable/);
  assert.equal((await sharp(Buffer.from(await image.arrayBuffer())).metadata()).width, 1600);
  assert.equal((await fetch(`${base}/api/media/private/secret.webp`)).status, 404);
  assert.equal((await fetch(`${base}/api/media/media/admin/${randomUUID()}.webp`)).status, 404);
  console.log("PASS: upload, same-origin image bytes, dimensions, caching, private/missing key rejection");

  data.photo = media.url;
  const created = await save(data);
  assert.equal(created.status, 200, JSON.stringify(await created.clone().json()));
  assert.equal((await created.json()).id, slug);
  const stored = await db.collection("teams").findOne({ _id: slug });
  assert.equal(stored.slug, slug);
  assert.equal(stored.photo, media.url);
  assert.equal((await save(data)).status, 409);
  assert.equal((await save({ ...data, slug: `${slug}-changed` }, slug, stored._rev)).status, 400);
  const page = await fetch(`${base}/takimlar/${slug}`);
  assert.equal(page.status, 200);
  assert.ok((await page.text()).includes(media.url));
  console.log("PASS: uppercase team save, stored photo, public page, duplicate and existing-slug protection");
} finally {
  try {
    await db.collection("teams").deleteOne({ _id: slug });
    await db.collection("adminHistory").deleteMany({ userId: id });
    await db.collection("adminSessions").deleteMany({ userId: id });
    await db.collection("adminUsers").deleteOne({ _id: id });
    if (uploadedKey) await deleteR2Object(uploadedKey);
  } finally {
    await closeMongoClient();
    getR2Client().destroy();
  }
}
