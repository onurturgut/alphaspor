import assert from "node:assert/strict";
import { standings } from "../src/lib/matches.ts";
import { schemas } from "../src/lib/admin/schema.ts";
import { fixtureRows, participants } from "./data/u12-2026-2027.mjs";

const competition = {
  _id: "test",
  name: "Test",
  teamSlug: "u12",
  season: "2026/2027",
  kind: "official",
  clubName: "Alfa",
  opponentIds: ["b", "c", "x", "y"],
  duration: 60,
  starterCount: 8,
  allowReentry: false,
  winPoints: 3,
  drawPoints: 1,
  lossPoints: 0,
  published: true,
  standingsRule: "tff",
  headToHeadMeetings: 2,
};
const opponents = competition.opponentIds.map((id) => ({ _id: id, name: id }));
let sequence = 0;
const match = (homeId, awayId, homeScore, awayScore, fields = {}) => ({
  id: `test-${sequence++}`,
  competitionId: "test",
  teamSlug: "u12",
  league: "Test",
  season: "2026/2027",
  week: 1,
  date: "2026-10-24",
  time: null,
  venue: null,
  note: null,
  homeTeam: homeId,
  awayTeam: awayId,
  homeId,
  awayId,
  homeScore,
  awayScore,
  status: "played",
  published: true,
  ...fields,
});
const table = (matches, fields = {}) =>
  standings({ ...competition, ...fields }, opponents, matches);
const before = (rows, a, b) =>
  assert(rows.find((r) => r.id === a).rank < rows.find((r) => r.id === b).rank);
const headToHead = [
  match("club", "b", 1, 0),
  match("b", "club", 0, 0),
  match("club", "x", 0, 1),
  match("b", "x", 5, 0),
  match("x", "y", 1, 0),
];
before(table(headToHead), "club", "b"); // 4–1 mutual points beats 0 vs +4 overall GD.
before(table(headToHead, { standingsRule: "general" }), "b", "club");
const pending = headToHead.map((m, i) =>
  i === 1
    ? { ...m, status: "unreported", homeScore: null, awayScore: null }
    : m,
);
before(table(pending), "b", "club");
assert(table(pending).find((r) => r.id === "club").provisional);
const draftReturn = headToHead.map((m, i) =>
  i === 1 ? { ...m, published: false } : m,
);
before(table(draftReturn), "b", "club");
assert(table(draftReturn).find((r) => r.id === "club").provisional);

// Equal mutual points: aggregate goal difference, never away-goal weight.
before(
  table([match("club", "b", 3, 0), match("b", "club", 2, 0)]),
  "club",
  "b",
);
const awayGoals = table([match("club", "b", 1, 0), match("b", "club", 2, 1)]);
assert.equal(
  awayGoals.find((r) => r.id === "club").rank,
  awayGoals.find((r) => r.id === "b").rank,
);
assert(awayGoals.find((r) => r.id === "club").tied);

// Three-team mini-table: C and B have +1; C's 3 goals beat B's 2.
const three = [
  match("club", "b", 1, 0),
  match("b", "c", 2, 0),
  match("c", "club", 3, 0),
  match("club", "x", 10, 0),
  match("b", "x", 1, 0),
  match("c", "x", 1, 0),
];
const rows = table(three, { headToHeadMeetings: 1 });
before(rows, "c", "b");
before(rows, "b", "club");
// Do not restart a two-team comparison after a three-team mini-table tie.
const cycle = [
  match("club", "b", 1, 0),
  match("b", "c", 1, 0),
  match("c", "club", 1, 0),
  match("club", "x", 4, 0),
  match("b", "x", 5, 0),
  match("c", "x", 6, 0),
];
const cycleRows = table(cycle, { headToHeadMeetings: 1 });
before(cycleRows, "c", "b");
before(cycleRows, "b", "club");

const forfeits = [
  match("club", "b", 3, 0),
  match("b", "club", 3, 0, { status: "awarded" }),
];
before(table(forfeits), "b", "club");
assert.equal(table(forfeits).find((r) => r.id === "club").points, 3);
assert.equal(
  table([match("club", "b", 0, 0)]).find((r) => r.id === "club").points,
  1,
);
assert.equal(
  table([match("club", "b", 4, 0, { status: "withdrawn" })]).find(
    (r) => r.id === "club",
  ).played,
  0,
);
assert.equal(
  table([match("club", "b", 4, 0, { competitionId: "other" })]).find(
    (r) => r.id === "club",
  ).played,
  0,
);
assert.deepEqual(table(headToHead, { kind: "friendly" }), []);
assert.deepEqual(table(headToHead, { standingsEnabled: false }), []);
const corrected = structuredClone(headToHead);
corrected[0].homeScore = 0;
corrected[0].awayScore = 1;
before(table(corrected), "b", "club");
assert.equal(headToHead[0].homeScore, 1);

assert.equal(fixtureRows.length, 56);
for (let week = 1; week <= 14; week++) {
  const round = fixtureRows.filter((r) => r.week === week);
  assert.equal(round.length, 4);
  assert.equal(new Set(round.flatMap((r) => [r.homeId, r.awayId])).size, 8);
}
for (const home of Object.keys(participants))
  for (const away of Object.keys(participants)) {
    if (home !== away)
      assert.equal(
        fixtureRows.filter((r) => r.homeId === home && r.awayId === away)
          .length,
        1,
      );
  }
assert.equal(
  fixtureRows.filter((r) => r.date === "2026-10-24" && r.time === "15:00")
    .length,
  4,
);
assert(
  fixtureRows
    .filter((r) => r.week > 1)
    .every((r) => r.date === "" && r.time === null),
);
assert.equal(fixtureRows.filter((r) => r.venue === "SEYDİKEMER").length, 7);
assert(schemas.competitions.safeParse(competition).success);
assert(
  !schemas.competitions.safeParse({ ...competition, headToHeadMeetings: 0 })
    .success,
);
assert(
  !schemas.competitions.safeParse({ ...competition, standingsRule: "random" })
    .success,
);
console.log(
  "TFF standings: mutual points/GD/goals, multi-team table, provisional fixtures, no away goals, forfeits, shared ranks, corrections and 56 U12 fixtures passed.",
);
