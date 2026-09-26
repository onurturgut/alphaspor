import assert from "node:assert/strict";
import { playerStats, playerAppearances, positionZone } from "../src/lib/academy.ts";
import { playerSchema, schemas } from "../src/lib/admin/schema.ts";

const player = { id: "test-player", name: "Test Oyuncu", position: "Orta saha", photo: "/media/test.webp", placeholder: false };
const match = { id: "a", date: "2026-09-10", season: "2026/2027", opponent: "Rakip A", kind: "official", goals: 2, assists: 1, minutes: 40, started: true, saves: null, cleanSheet: null };
const rows = [match, { ...match, id: "b", date: "2026-09-17", opponent: "Rakip B", goals: 0, assists: 2, minutes: 20, started: false }, { ...match, id: "c", season: "2025/2026", opponent: "Rakip C", kind: "friendly", goals: 9 }];
const profile = playerSchema.parse({ ...player, shirtNumber: 7, foot: "left", goal: "İki ayağımla pas vermek", appearances: rows });
const current = playerAppearances(profile, "2026/2027");
const totals = playerStats(current);
assert.deepEqual([totals.matches, totals.goals, totals.assists, totals.contributions, totals.minutes, totals.starts, totals.goalsPerMatch, totals.assistsPerMatch], [2, 2, 3, 5, 60, 1, 1, 1.5]);
assert.equal(current[0].opponent, "Rakip B");
assert.equal(rows[0].id, "a", "Filtering must not mutate saved appearance order");
assert.equal(playerAppearances(profile, "2026/2027", "friendly").length, 0);
assert.equal(playerStats(playerAppearances(profile, "2025/2026", "friendly")).goals, 9);
assert.equal(playerStats([]).matches, null);
assert.equal(playerStats([]).goals, null);
assert.equal(playerStats([{ ...match, goals: 0, assists: 0 }]).contributions, 0);
const partial = playerStats([match, { ...rows[1], goals: null }]);
assert.equal(partial.goals, null, "Incomplete goals must not look like a complete season total");
assert.equal(partial.assists, 3);
assert.equal(partial.contributions, null);
const keeper = playerStats([{ ...match, saves: 5, cleanSheet: true }, { ...rows[1], saves: 3, cleanSheet: false }]);
assert.equal(keeper.saves, 8);
assert.equal(keeper.cleanSheets, 1);
assert.equal(playerStats([{ ...match, started: null }]).starts, null);
assert.equal(positionZone("Kaleci").key, "goalkeeper");
assert.equal(positionZone("Sol bek").key, "defence");
assert.equal(positionZone("Sağ kanat").key, "attack");
assert.equal(positionZone("").key, "unknown");

assert.ok(playerSchema.safeParse(player).success, "Existing players require no migration");
assert.equal(playerSchema.safeParse({ ...player, shirtNumber: -1 }).success, false);
for (const patch of [{ goals: -1 }, { assists: 1.5 }, { minutes: 151 }, { goals: "2" }, { date: "2026-02-30" }, { season: "2026" }]) {
  assert.equal(playerSchema.safeParse({ ...player, appearances: [{ ...match, ...patch }] }).success, false);
}
assert.equal(playerSchema.safeParse({ ...player, appearances: [match, { ...match, id: "duplicate" }] }).success, false);
assert.equal(playerSchema.safeParse({ ...player, appearances: [match, { ...match, date: "2026-09-20" }] }).success, false);
const team = schemas.teams.parse({ name: "U10", slug: "u10", season: "2026/2027", photo: "/media/team.webp", photoAlt: "Takım", players: [profile], order: 0 });
const restored = schemas.teams.parse(JSON.parse(JSON.stringify(team)));
assert.equal(restored.players[0].appearances.length, 3, "Admin team schema must preserve match records");
assert.equal(restored.players[0].shirtNumber, 7);
assert.equal(restored.players[0].foot, "left");
assert.equal(restored.players[0].goal, profile.goal);
assert.deepEqual(playerStats(playerAppearances(restored.players[0], "2026/2027")), totals);
console.log("PASS: season/type filters, goal/assist totals, zero vs unknown, partial records, goalkeeper stats, legacy players, schema validation and admin serialization.");
