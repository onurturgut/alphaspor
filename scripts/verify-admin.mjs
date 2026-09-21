import assert from "node:assert/strict";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import nextEnv from "@next/env";
import sharp from "sharp";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
nextEnv.loadEnvConfig(process.cwd(), true);
const { getDb, closeMongoClient } = await import("../src/lib/mongodb.ts");
const { hashPassword } = await import("../src/lib/admin/password.ts");
const { getR2Client } = await import("../src/lib/r2.ts");
const base = process.argv[2] || "http://127.0.0.1:3104";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("Use a local test server");
const suffix = randomUUID(), userId = `verify-${suffix}`, email = `verify-${suffix}@example.com`;
const password = randomBytes(24).toString("hex");
const created = []; let uploadedKey; let cookie = "";
const db = await getDb();
async function request(path, method = "GET", data, auth = true, origin = base) {
  const headers = { Origin: origin };
  if (auth && cookie) headers.Cookie = cookie;
  if (data !== undefined) headers["Content-Type"] = "application/json";
  return fetch(base + path, { method, headers, body: data === undefined ? undefined : JSON.stringify(data), redirect: "manual" });
}
async function body(response, expected = 200) {
  assert.equal(response.status, expected, `Unexpected HTTP ${response.status}`);
  return response.json();
}
async function save(section, data, existing = null) {
  const result = await body(await request(`/api/admin/data/${section}`, "PUT", { id: existing?._id ?? null, version: existing?._rev ?? null, data }));
  if (!existing) created.push([section, result.id]);
  return db.collection(section).findOne({ _id: result.id });
}
try {
  await db.collection("adminUsers").insertOne({ _id: userId, email, passwordHash: await hashPassword(password), active: true });
  assert.equal((await request("/admin", "GET", undefined, false)).status, 307);
  await body(await request("/api/admin/data/news", "GET", undefined, false), 401);
  await body(await request("/api/admin/data/news", "PUT", {}, false), 401);
  await body(await request("/api/admin/login", "POST", { email, password }, false, "https://invalid.example"), 403);
  const login = await request("/api/admin/login", "POST", { email, password }, false);
  const setCookie = login.headers.get("set-cookie");
  await body(login); assert.match(setCookie, /HttpOnly/i); assert.match(setCookie, /SameSite=strict/i);
  cookie = setCookie.split(";")[0];
  assert.equal((await request("/admin")).status, 200);
  await body(await request("/api/admin/data/adminUsers"), 404);
  await body(await request("/api/admin/data/news", "PUT", { id: null, version: null, data: { title: "" } }), 400);
  await body(await request("/api/admin/data/news", "PUT", {}, true, "https://invalid.example"), 403);
  console.log("PASS: authenticated routes, secure cookie attributes, CSRF, section whitelist, validation");

  const newsData = { title: `VERIFY ${suffix}`, category: "Test", subtitle: "Test", body: "Verification article body", image: "", published: false, order: 9999 };
  let news = await save("news", newsData);
  assert.equal((await request(`/haberler/${news._id}`, "GET", undefined, false)).status, 404);
  news = await save("news", { ...newsData, published: true }, news);
  const article = await request(`/haberler/${news._id}`, "GET", undefined, false);
  assert.equal(article.status, 200); assert.ok((await article.text()).includes(newsData.title));
  await body(await request("/api/admin/data/news", "PUT", { id: news._id, version: 1, data: newsData }), 409);
  console.log("PASS: news creation, draft privacy, publication, stale update rejection");

  const existingTeams = await body(await request("/api/admin/data/teams"));
  let team = await save("teams", { slug: `verify-${suffix}`, name: "Verification team", season: "2030/2031", photo: existingTeams.records[0].photo, photoAlt: "Test", players: [{ id: "verify-player", name: "Verification player", position: "Forvet", photo: "", placeholder: true }], order: 9999 });
  assert.equal(team.playerCount, 1);
  team = await save("teams", { ...team, players: [...team.players, { id: "verify-player-2", name: "Second player", position: "Kaleci", photo: "", placeholder: true }] }, team);
  assert.equal(team.playerCount, 2);
  const teamPage = await request(`/takimlar/${team._id}`, "GET", undefined, false);
  assert.equal(teamPage.status, 200); assert.ok((await teamPage.text()).includes("Verification player"));
  const matchData = { teamSlug: team.slug, league: "Test", season: "2030/2031", week: 1, date: "2030-10-01", time: null, homeTeam: "FETHİYE ALFA SPOR", awayTeam: "Verification opponent", homeScore: 2, awayScore: 1, status: "played", venue: null, note: null, order: 9999 };
  const match = await save("matches", matchData);
  await body(await request("/api/admin/data/matches", "PUT", { id: null, version: null, data: { ...matchData, homeScore: null } }), 400);
  const matchPage = await request(`/maclar?takim=${team.slug}&sezon=2030/2031`, "GET", undefined, false);
  assert.equal(matchPage.status, 200); assert.ok((await matchPage.text()).includes("Verification opponent"));
  await body(await request("/api/admin/data/teams", "DELETE", { id: team._id, version: team._rev }), 400);
  console.log("PASS: teams, players, counts, dynamic seasons/filters, match validation and references");

  const staff = await save("staff", { name: `Verify coach ${suffix}`, role: "Coach", bio: "Verification bio", photo: "", order: 9999 });
  assert.ok((await (await request("/kulubumuz", "GET", undefined, false)).text()).includes(staff.name));
  const settings = (await body(await request("/api/admin/data/settings"))).records[0];
  const bad = structuredClone(settings); bad.home.primaryHref = "javascript:alert(1)";
  await body(await request("/api/admin/data/settings", "PUT", { id: "club", version: settings._rev ?? null, data: bad }), 400);
  // Save the same content to exercise settings validation without publishing test text.
  await save("settings", settings, settings);
  console.log("PASS: staff publishing, complete settings save, unsafe URL rejection");

  const image = await sharp({ create: { width: 24, height: 24, channels: 3, background: "#123456" } }).png().toBuffer();
  const form = new FormData(); form.append("file", new Blob([image], { type: "image/png" }), "verify.png");
  const upload = await fetch(base + "/api/admin/upload", { method: "POST", headers: { Cookie: cookie, Origin: base }, body: form });
  const media = await body(upload); uploadedKey = decodeURIComponent(new URL(media.url).pathname).replace(/^\//, "");
  assert.equal(media.width, 24); assert.equal(media.height, 24);
  const publicImage = await fetch(media.url); assert.equal(publicImage.status, 200); assert.match(publicImage.headers.get("content-type"), /image\/webp/);
  console.log("PASS: authorized upload, image conversion, R2 public access");

  for (const [section, record] of [["news", news], ["matches", match], ["teams", team], ["staff", staff]]) {
    await body(await request(`/api/admin/data/${section}`, "DELETE", { id: record._id, version: record._rev }));
    assert.equal((await db.collection(section).findOne({ _id: record._id }))._deleted, true);
  }
  assert.equal((await request(`/haberler/${news._id}`, "GET", undefined, false)).status, 404);
  console.log("PASS: deletion, public removal, retained history");

  await body(await request("/api/admin/password", "POST", { current: password, password: `${password}-new` }));
  await body(await request("/api/admin/data/news"), 401);
  const loginAgain = await request("/api/admin/login", "POST", { email, password: `${password}-new` }, false);
  cookie = loginAgain.headers.get("set-cookie")?.split(";")[0] ?? ""; await body(loginAgain);
  await body(await request("/api/admin/logout", "POST"));
  await body(await request("/api/admin/data/news"), 401);
  for (let i=0;i<8;i++) await request("/api/admin/login", "POST", { email, password: "wrong-password" }, false);
  await body(await request("/api/admin/login", "POST", { email, password: "wrong-password" }, false), 429);
  console.log("PASS: password change, revoked sessions, logout, persistent login rate limit");
} catch (error) {
  console.error("FAIL:", error instanceof assert.AssertionError ? error.message : error.name);
  process.exitCode = 1;
} finally {
  for (const [section, id] of created) await db.collection(section).deleteOne({ _id: id });
  await db.collection("adminHistory").deleteMany({ userId });
  await db.collection("adminUsers").deleteOne({ _id: userId });
  await db.collection("adminSessions").deleteMany({ userId });
  const accountKey = createHash("sha256").update(email).digest("hex");
  await db.collection("adminLoginAttempts").deleteMany({ _id: { $regex: `^account:${accountKey}:` } });
  if (uploadedKey?.startsWith("media/admin/")) await getR2Client().send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: uploadedKey }));
  await closeMongoClient();
  try { getR2Client().destroy(); } catch { /* Upload not reached. */ }
  console.log("Verification records removed.");
}
