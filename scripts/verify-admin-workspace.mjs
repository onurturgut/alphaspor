import assert from "node:assert/strict";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, unlinkSync } from "node:fs";
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd(), true);
const { getDb, closeMongoClient } = await import("../src/lib/mongodb.ts");
const { hashPassword } = await import("../src/lib/admin/password.ts");
const base = process.env.VERIFY_BASE || "http://127.0.0.1:3000";
assert.ok(["127.0.0.1", "localhost"].includes(new URL(base).hostname));
const db = await getDb();
const fixtureFile = ".local-backups/workspace-verification.json";
if (process.argv.includes("--cleanup")) {
  const fixture = JSON.parse(readFileSync(fixtureFile, "utf8"));
  assert.ok(fixture.userId.startsWith("workspace-verify-"));
  await db.collection("adminSessions").deleteMany({ userId: fixture.userId });
  await db.collection("adminPreviews").deleteMany({ userId: fixture.userId });
  await db.collection("adminUsers").deleteOne({ _id: fixture.userId });
  await db.collection("adminHistory").deleteMany({ userId: fixture.userId });
  unlinkSync(fixtureFile);
  await closeMongoClient();
  console.log("PASS: temporary browser account removed");
  process.exit(0);
}
const userId = `workspace-verify-${randomUUID()}`;
const token = randomBytes(32).toString("hex");
const cookie = `alpha_admin=${token}`;
const createdUsers = [], opponents = [], previews = [];
let keep = false;
async function request(path, method = "GET", data, auth = cookie, origin = base) {
  return fetch(base + path, { method, headers: { Cookie: auth, Origin: origin, "Content-Type": "application/json" }, body: data === undefined ? undefined : JSON.stringify(data), redirect: "manual" });
}
async function json(response, status = 200) {
  const body = await response.json();
  assert.equal(response.status, status, JSON.stringify(body));
  return body;
}
try {
  await db.collection("adminUsers").insertOne({ _id: userId, email: `${userId}@example.com`, name: "Workspace verification", role: "admin", active: true, passwordHash: await hashPassword(randomBytes(24).toString("hex")) });
  await db.collection("adminSessions").insertOne({ _id: createHash("sha256").update(token).digest("hex"), userId, expiresAt: new Date(Date.now() + 3600000) });
  await json(await request("/api/admin/users", "GET", undefined, ""), 401);
  await json(await request("/api/admin/users", "PUT", {}, cookie, "https://invalid.example"), 403);
  const users = await json(await request("/api/admin/users"));
  assert.ok(users.records.every(u => !("passwordHash" in u)));
  const email = `editor-${randomUUID()}@example.com`, password = randomBytes(20).toString("hex");
  const input = { name: "Verification editor", email, password, role: "editor", active: true };
  await json(await request("/api/admin/users", "PUT", input));
  const editor = await db.collection("adminUsers").findOne({ email });
  createdUsers.push(editor._id);
  await json(await request("/api/admin/users", "PUT", input), 409);
  const editorToken = randomBytes(32).toString("hex");
  await db.collection("adminSessions").insertOne({ _id: createHash("sha256").update(editorToken).digest("hex"), userId: editor._id, expiresAt: new Date(Date.now() + 3600000) });
  await json(await request("/api/admin/users", "GET", undefined, `alpha_admin=${editorToken}`), 403);
  await json(await request("/api/admin/users", "PUT", { ...input, id: editor._id, password: "", active: false }));
  await json(await request("/api/admin/data/news", "GET", undefined, `alpha_admin=${editorToken}`), 401);
  await json(await request("/api/admin/users", "PUT", { ...input, id: userId, email: `${userId}@example.com`, role: "admin", active: false }), 400);
  console.log("PASS: user CRUD, unique email, role enforcement, session revocation, self-lockout protection, CSRF");
  const settings = (await json(await request("/api/admin/data/settings"))).records[0];
  for (const invalid of [null, [], {}, { data: null }]) {
    await json(await request("/api/admin/preview", "POST", invalid), 400);
  }
  const marker = `Preview ${randomUUID()}`;
  const result = await json(await request("/api/admin/preview", "POST", { data: { ...settings, home: { ...settings.home, title: marker } } }));
  previews.push(result.id);
  const previewResponse = await request(`/onizleme?page=home&revision=${result.id}`);
  assert.equal(previewResponse.status, 200);
  assert.ok((await previewResponse.text()).includes(marker), "Actual page must render draft title");
  const live = await request("/", "GET", undefined, "");
  assert.ok(!(await live.text()).includes(marker), "Draft must never leak into live page");
  const stolen = await request(`/onizleme?page=home&revision=${result.id}`, "GET", undefined, "");
  assert.equal(stolen.status, 307);
  assert.equal(stolen.headers.get("location"), "/admin/giris");
  for (const page of ["club", "teams", "news", "matches", "contact"]) {
    assert.equal((await request(`/onizleme?page=${page}&revision=${result.id}`)).status, 200, page);
  }
  for (const page of ["unknown", "toString", "constructor", "__proto__"]) {
    const response = await request(`/onizleme?page=${page}&revision=${result.id}`);
    assert.equal(response.status, 200, page);
    assert.ok((await response.text()).includes(marker), "Unknown pages must fall back to the home preview");
  }
  console.log("PASS: real-page previews for all six pages, live content isolation, authentication");
  const teams = (await json(await request("/api/admin/data/teams"))).records;
  const opponent = await json(await request("/api/admin/data/opponents", "PUT", { id: null, version: null, data: { name: "Verification opponent", teamSlugs: [teams[0].slug], order: 9999 } }));
  opponents.push(opponent.id);
  assert.deepEqual((await db.collection("opponents").findOne({ _id: opponent.id })).teamSlugs, [teams[0].slug]);
  await json(await request("/api/admin/data/opponents", "PUT", { id: null, version: null, data: { name: "Invalid", teamSlugs: ["missing-team"], order: 9999 } }), 400);
  assert.equal((await request("/takimlar/u14")).headers.get("location"), "/takimlar/u14-u15");
  console.log("PASS: opponent age group persistence, invalid team rejection, U14 redirect");
  if (process.argv.includes("--browser")) {
    mkdirSync(".local-backups", { recursive: true });
    writeFileSync(fixtureFile, JSON.stringify({ userId }));
    // Generated hex token is passed directly to the local browser, never logged.
    execFileSync("cmd.exe", ["/d", "/s", "/c", `agent-browser cookies set alpha_admin ${token} --url ${base}`], { stdio: "pipe" });
    keep = true;
    console.log("PASS: temporary authenticated browser ready; run --cleanup after visual verification");
  }
} finally {
  await db.collection("adminUsers").deleteMany({ _id: { $in: createdUsers } });
  await db.collection("adminSessions").deleteMany({ userId: { $in: createdUsers } });
  await db.collection("opponents").deleteMany({ _id: { $in: opponents } });
  await db.collection("adminPreviews").deleteMany({ _id: { $in: previews } });
  if (!keep) {
    await db.collection("adminUsers").deleteOne({ _id: userId });
    await db.collection("adminSessions").deleteMany({ userId });
    await db.collection("adminHistory").deleteMany({ userId });
  }
  await closeMongoClient();
}
