import assert from "node:assert/strict";
import {
  createPositionBasedLineup,
  defaultStarterCountForTeam,
  formationIdsForPlayerCount,
  formationSlots,
  mobilePitchPosition,
  playerRoles,
} from "../src/lib/formations.ts";

assert.equal(defaultStarterCountForTeam("U12"), 8);
assert.equal(defaultStarterCountForTeam("u-10 minikler"), 8);
assert.equal(defaultStarterCountForTeam("U13"), 11);
assert.equal(defaultStarterCountForTeam("U14"), 11);

assert.deepEqual(formationIdsForPlayerCount(8), [
  "2-3-2",
  "3-2-2",
  "3-3-1",
  "2-4-1",
  "3-1-2-1",
  "3-2-1-1",
  "2-2-2-1",
  "2-2-1-2",
  "2-1-3-1",
  "4-2-1",
  "4-1-2",
]);
assert.deepEqual(formationIdsForPlayerCount(11), [
  "4-3-3",
  "4-2-3-1",
  "4-4-2",
  "4-1-4-1",
  "4-1-2-1-2",
  "4-3-1-2",
  "4-4-1-1",
  "3-4-3",
  "3-4-2-1",
  "3-5-2",
  "3-4-1-2",
  "5-3-2",
  "5-4-1",
  "5-2-2-1",
]);
assert.deepEqual(playerRoles("Kaleci (GK)"), ["GK"]);
assert.deepEqual(playerRoles("Sağ Kanat / Sağ Bek"), ["RB", "RW"]);
assert.deepEqual(playerRoles("Defansif Orta Saha / Ön Libero"), ["CDM"]);
assert.deepEqual(playerRoles("İkinci Forvet"), ["SS"]);

const players = [
  ["gk", "Kaleci"],
  ["lb", "Sol Bek"],
  ["cb", "Stoper"],
  ["rb", "Sağ Bek"],
  ["lm", "Sol Kanat"],
  ["cm", "Merkez Orta Saha"],
  ["rm", "Sağ Kanat"],
  ["st", "Santrafor"],
].map(([id, position]) => ({ id, position }));
const lineup = createPositionBasedLineup("3-3-1", players);
assert.equal(lineup.length, 8);
assert.equal(new Set(lineup.map((item) => item.playerId)).size, 8);
assert.equal(lineup.find((item) => item.slotId === "gk")?.playerId, "gk");
assert.equal(lineup.find((item) => item.slotId === "st")?.playerId, "st");
assert.deepEqual(
  lineup.map((item) => item.slotId),
  formationSlots("3-3-1").map((item) => item.id),
);

const mobileSlots = formationSlots("3-3-1");
const mobileDefenders = ["lb", "cb", "rb"].map((id) =>
  mobilePitchPosition(
    mobileSlots,
    mobileSlots.find((slot) => slot.id === id),
  ),
);
assert.ok(parseFloat(mobileDefenders[0].left) < 30);
assert.ok(parseFloat(mobileDefenders[1].left) > 45);
assert.ok(parseFloat(mobileDefenders[2].left) > 70);

console.log(
  "PASS: 8/11-player formation filtering, Turkish position normalization and automatic lineup assignment.",
);
