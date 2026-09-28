import assert from "node:assert/strict";
import {
  generateFixtures,
  matchAppearances,
  reportScore,
  validateReport,
  standings,
  withMatchAppearances,
  matchOutcome,
  formatMatchDate,
  selectMatches,
} from "../src/lib/matches.ts";
import { schemas } from "../src/lib/admin/schema.ts";

const players = ["a", "b", "c", "d"].map((id) => ({
  id,
  name: id,
  position: "Orta saha",
  photo: "",
  placeholder: false,
}));
const competition = {
  _id: "league",
  name: "U11 Ligi",
  teamSlug: "u11",
  season: "2026/2027",
  kind: "official",
  clubName: "ALFA",
  opponentIds: ["r1", "r2"],
  duration: 60,
  starterCount: 2,
  allowReentry: false,
  winPoints: 3,
  drawPoints: 1,
  lossPoints: 0,
  published: true,
};
const opponents = [
  { _id: "r1", name: "Rakip 1" },
  { _id: "r2", name: "Rakip 2" },
];
const fixtures = generateFixtures(
  competition,
  opponents,
  "2026-10-01",
  7,
  true,
);
assert.equal(fixtures.length, 6);
assert.equal(new Set(fixtures.map((m) => m.id)).size, 6);
for (const week of new Set(fixtures.map((m) => m.week))) {
  const participants = fixtures
    .filter((m) => m.week === week)
    .flatMap((m) => [m.homeId, m.awayId]);
  assert.equal(
    new Set(participants).size,
    participants.length,
    "No team plays twice in a round",
  );
}
for (const a of ["club", "r1", "r2"])
  for (const b of ["club", "r1", "r2"])
    if (a !== b)
      assert.equal(
        fixtures.filter((m) => m.homeId === a && m.awayId === b).length,
        1,
      );
const evenCompetition = {
  ...competition,
  opponentIds: [...competition.opponentIds, "r3"],
};
assert.equal(
  generateFixtures(
    evenCompetition,
    [...opponents, { _id: "r3", name: "Rakip 3" }],
    "2026-10-01",
    7,
    false,
  ).length,
  6,
);
assert.ok(fixtures.every((m) => m.published === false && m.report === null));
const match = {
  ...fixtures.find((m) => m.homeId === "club"),
  id: "test",
  published: true,
  status: "played",
  homeScore: 2,
  awayScore: 1,
  report: {
    clubSide: "home",
    duration: 60,
    starterCount: 2,
    allowReentry: false,
    starters: ["a", "b"],
    bench: ["c", "d"],
    events: [
      {
        id: "g1",
        type: "goal",
        minute: 10,
        side: "home",
        playerId: "a",
        assistId: "b",
        kind: "normal",
      },
      { id: "s1", type: "substitution", minute: 20, outId: "a", inId: "c" },
      {
        id: "g2",
        type: "goal",
        minute: 30,
        side: "home",
        playerId: "c",
        assistId: null,
        kind: "penalty",
      },
      {
        id: "g3",
        type: "goal",
        minute: 35,
        side: "away",
        playerId: null,
        assistId: null,
        kind: "normal",
      },
    ],
  },
};
assert.deepEqual(validateReport(match, players), []);
assert.ok(schemas.matches.safeParse(match).success);
assert.deepEqual(reportScore(match.report), { home: 2, away: 1 });
const stats = matchAppearances(match);
assert.deepEqual(
  [
    stats.get("a").goals,
    stats.get("a").minutes,
    stats.get("b").assists,
    stats.get("b").minutes,
    stats.get("c").goals,
    stats.get("c").minutes,
    stats.get("c").started,
  ],
  [1, 20, 1, 60, 1, 40, false],
);
assert.equal(stats.has("d"), false, "Unused substitutes get no appearance");
for (const status of ["awarded", "withdrawn", "unreported"])
  assert.equal(matchAppearances({ ...match, status }).size, 0);
assert.equal(matchAppearances({ ...match, published: false }).size, 0);
const legacy = {
  id: "manual",
  season: "2025/2026",
  date: "2026-01-01",
  opponent: "Eski rakip",
  kind: "friendly",
  goals: 1,
  assists: 0,
  minutes: 30,
  started: true,
};
const teams = [
  {
    slug: "u11",
    players: [{ ...players[0], appearances: [legacy] }, ...players.slice(1)],
  },
];
const enriched = withMatchAppearances(teams, [match]);
assert.equal(enriched[0].players[0].appearances.length, 2);
assert.equal(
  withMatchAppearances(enriched, [match])[0].players[0].appearances.length,
  2,
  "Repeated calculation never duplicates",
);
assert.equal(
  withMatchAppearances(enriched, [])[0].players[0].appearances.length,
  1,
  "Deleting match removes its statistics",
);
assert.equal(
  withMatchAppearances(enriched, [
    {
      ...match,
      report: {
        ...match.report,
        events: match.report.events.filter((e) => e.id !== "g1"),
      },
    },
  ])[0].players[0].appearances[1].goals,
  0,
  "Editing match recomputes totals",
);
assert.equal(
  teams[0].players[0].appearances.length,
  1,
  "Source records are not mutated",
);
const own = {
  ...match,
  homeScore: 0,
  awayScore: 1,
  report: {
    ...match.report,
    events: [
      { ...match.report.events[0], side: "away", kind: "own", assistId: null },
    ],
  },
};
assert.deepEqual(validateReport(own, players), []);
assert.equal(
  matchAppearances(own).get("a").goals,
  0,
  "Own goals never increase personal goals",
);
const badEvents = [
  { ...match.report.events[0], assistId: "a" },
  { ...match.report.events[0], minute: 61 },
  { ...match.report.events[0], playerId: "d" },
  { ...match.report.events[1], outId: "d" },
  { ...match.report.events[1], inId: "b" },
  { ...match.report.events[0], kind: "penalty" },
];
for (const event of badEvents)
  assert.ok(
    validateReport(
      {
        ...match,
        status: "unreported",
        report: { ...match.report, events: [event] },
      },
      players,
    ).length,
  );
assert.ok(
  validateReport(
    { ...match, report: { ...match.report, starters: ["a", "a"] } },
    players,
  ).length,
);
assert.ok(
  validateReport(
    { ...match, report: { ...match.report, starters: ["a", "unknown"] } },
    players,
  ).length,
);
const reentry = {
  ...match,
  report: {
    ...match.report,
    allowReentry: true,
    events: [
      ...match.report.events,
      { id: "s2", type: "substitution", minute: 40, outId: "c", inId: "a" },
    ],
  },
};
assert.deepEqual(validateReport(reentry, players), []);
assert.equal(matchAppearances(reentry).get("a").minutes, 40);
assert.equal(matchAppearances(reentry).get("c").minutes, 20);
assert.ok(
  validateReport(
    { ...reentry, report: { ...reentry.report, allowReentry: false } },
    players,
  ).length,
);
const rivals = {
  ...fixtures.find((m) => m.homeId !== "club" && m.awayId !== "club"),
  status: "played",
  homeScore: 3,
  awayScore: 0,
  published: true,
};
assert.equal(matchOutcome(rivals), null);
assert.equal(
  standings(competition, opponents, [match]).find((r) => r.id === "club")
    .points,
  3,
);
assert.equal(
  standings(competition, opponents, [{ ...match, published: false }]).find(
    (r) => r.id === "club",
  ).played,
  0,
);
assert.equal(
  standings(competition, opponents, [{ ...match, status: "withdrawn" }]).find(
    (r) => r.id === "club",
  ).played,
  0,
);
assert.equal(
  standings(competition, opponents, [{ ...match, status: "awarded" }]).find(
    (r) => r.id === "club",
  ).points,
  3,
);
assert.equal(
  standings(competition, opponents, [
    { ...match, homeScore: 1, awayScore: 1 },
  ]).find((r) => r.id === "club").points,
  1,
);
assert.equal(
  standings(competition, opponents, [rivals]).reduce((n, r) => n + r.played, 0),
  2,
);
for (const patch of [
  { date: "2026-02-30" },
  { homeScore: -1 },
  { homeId: "club", awayId: "club" },
  { report: { ...match.report, duration: 0 } },
])
  assert.equal(
    schemas.matches.safeParse({ ...match, ...patch }).success,
    false,
  );
assert.equal(
  schemas.competitions.safeParse({ ...competition, opponentIds: ["r1", "r1"] })
    .success,
  false,
);
assert.deepEqual(
  standings({ ...competition, standingsEnabled: false }, opponents, [match]),
  [],
);
const undated = { ...fixtures[0], date: "" };
assert.equal(schemas.matches.safeParse(undated).success, true);
assert.equal(schemas.matches.safeParse({ ...match, date: "" }).success, false);
assert.equal(formatMatchDate(""), "Tarih henüz açıklanmadı");
assert.deepEqual(
  selectMatches(
    [
      { ...undated, week: 3 },
      { ...undated, week: 1 },
    ],
    "u11",
    "2026/2027",
  ).map((m) => m.week),
  [1, 3],
);
console.log(
  "PASS: fixtures, byes, return legs, scores, lineups, substitutions, reentry, minutes, assists, own goals, unused substitutes, standings, drafts, edits, deletion and legacy statistics.",
);
