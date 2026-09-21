import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { coachLicense } from "../src/lib/coach-license.ts";

const seed = JSON.parse(await readFile("src/data/content.json", "utf8"));
assert.equal(coachLicense(seed.staff[0]), "UEFA A");
assert.equal(coachLicense(seed.staff[1]), "UEFA C");
assert.equal(coachLicense(seed.staff[2]), "UEFA C · Başvuru aşamasında");
assert.equal(coachLicense(seed.staff[3]), "");
assert.equal(coachLicense({ license: "UEFA B", bio: seed.staff[0].bio }), "UEFA B");
assert.equal(coachLicense({ license: "", bio: seed.staff[0].bio }), "");

const handlers = {};
const removed = [];
let precached = [];
let offline = false;
let claimed = false;
let skipped = false;
const fallback = new Response("offline fallback");
const context = vm.createContext({
  URL, Response, AbortController, setTimeout, clearTimeout,
  self: {
    location: { origin: "https://alfa.test" },
    addEventListener: (type, fn) => { handlers[type] = fn; },
    clients: { claim: async () => { claimed = true; } },
    skipWaiting: () => { skipped = true; },
  },
  caches: {
    open: async () => ({ addAll: async (urls) => { precached = [...urls]; } }),
    keys: async () => ["unrelated-cache", "alfa-pwa-v0", "alfa-pwa-v1"],
    delete: async (name) => { removed.push(name); },
    match: async () => fallback.clone(),
  },
  fetch: async () => {
    if (offline) throw new TypeError("Network unavailable");
    return new Response("fresh network response");
  },
});
vm.runInContext(await readFile("public/sw.js", "utf8"), context);
let task;
handlers.install({ waitUntil: (promise) => { task = promise; } });
await task;
assert(precached.includes("/offline.html"));
for (const path of precached) await readFile(`public${path}`);
assert(!skipped, "Updates should wait for consent");
handlers.activate({ waitUntil: (promise) => { task = promise; } });
await task;
assert.deepEqual(removed, ["alfa-pwa-v0"]);
assert(claimed);
function request(path, options = {}) {
  let response;
  handlers.fetch({
    request: { url: new URL(path, "https://alfa.test").href, method: "GET", mode: "navigate", headers: new Headers(), ...options },
    respondWith: (promise) => { response = promise; },
  });
  return response;
}
assert.equal(await (await request("/maclar")).text(), "fresh network response");
offline = true;
assert.equal(await (await request("/maclar")).text(), "offline fallback");
assert.equal(request("/admin"), undefined);
assert.equal(request("/admin/giris"), undefined);
assert.equal(request("/api/admin/data/staff"), undefined);
assert.equal(request("/iletisim", { method: "POST" }), undefined);
assert.equal(request("/maclar?_rsc=123", { headers: new Headers({ RSC: "1" }) }), undefined);
assert.equal(request("https://another.test/"), undefined);
handlers.message({ data: { type: "SKIP_WAITING" } });
assert(skipped);
console.log("PASS: coach licenses, explicit overrides, offline fallback, cache isolation, network bypasses and update activation.");
