import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const counts = { u11: 14, u12: 18, u13: 14, u14: 18 };
const ids = new Set();
const records = [];

for (const [league, expectedCount] of Object.entries(counts)) {
  const matches = JSON.parse(
    readFileSync(`src/data/matches-${league}.json`, "utf8"),
  );
  assert.equal(
    matches.length,
    expectedCount,
    `${league}: all source rows retained`,
  );
  assert.deepEqual(
    matches.map((match) => match.week).sort((a, b) => a - b),
    Array.from({ length: expectedCount }, (_, index) => index + 1),
  );
  for (const match of matches) {
    assert(!ids.has(match.id), `Duplicate ID: ${match.id}`);
    ids.add(match.id);
    assert.equal(match.season, "2025/2026");
    assert.equal(match.league, league.toUpperCase());
    assert.equal(match.teamSlug, league === "u14" ? "u14-u15" : league);
    assert.match(match.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(
      new Date(`${match.date}T12:00:00Z`).toISOString().slice(0, 10),
      match.date,
      `Invalid calendar date: ${match.id}`,
    );
    assert(
      match.date >= "2025-07-01" && match.date <= "2026-06-30",
      `Date outside source season: ${match.id}`,
    );
    if (match.time !== null)
      assert.match(match.time, /^(?:[01]\d|2[0-3]):[0-5]\d$/);
    const alfaCount = [match.homeTeam, match.awayTeam].filter((team) =>
      team.includes("ALFA"),
    ).length;
    assert.equal(alfaCount, 1, `Exactly one Alfa team required: ${match.id}`);
    assert.equal(
      match.homeScore === null,
      match.awayScore === null,
      `Partial score: ${match.id}`,
    );
    const scored = match.homeScore !== null;
    assert.equal(
      scored,
      ["played", "awarded"].includes(match.status),
      `Score/status mismatch: ${match.id}`,
    );
    if (scored) {
      assert(Number.isInteger(match.homeScore) && match.homeScore >= 0);
      assert(Number.isInteger(match.awayScore) && match.awayScore >= 0);
    } else {
      assert(["unreported", "withdrawn"].includes(match.status));
    }
    assert(match.venue === null || typeof match.venue === "string");
    assert(match.note === null || typeof match.note === "string");
  }
  const image = readFileSync(`public/media/fixtures/${league}-2025-2026.jpg`);
  assert.equal(image.readUInt16BE(0), 0xffd8, `${league}: valid archived JPEG`);
  records.push(...matches);
}

assert.equal(records.filter((match) => match.homeScore !== null).length, 60);
assert.equal(records.filter((match) => match.status === "awarded").length, 2);
assert.equal(
  records.filter((match) => match.status === "unreported").length,
  3,
);
assert.equal(records.filter((match) => match.status === "withdrawn").length, 1);

// These source exceptions must survive normalization.
const find = (id) => records.find((match) => match.id === id);
assert.equal(
  find("u11-2025-2026-12").time,
  null,
  "Source 00:00 is an unspecified time, not midnight kickoff",
);
assert.deepEqual(
  [find("u13-2025-2026-03").homeScore, find("u13-2025-2026-03").awayScore],
  [0, 0],
  "Real 0–0 remains a reported result",
);
assert.equal(
  find("u14-2025-2026-09").date,
  "2025-12-17",
  "Source rescheduling must not be guessed from week number",
);
assert.equal(find("u14-2025-2026-14").date, "2026-01-20");
assert.equal(find("u11-2025-2026-13").awayTeam, "FETHİYE 1923 SPOR");
assert.equal(find("u11-2025-2026-14").homeTeam, "BALCI 48 SPOR");
console.log(
  "PASS: 64 source fixtures, 60 scores, 2 awarded results, 3 unreported results, 1 withdrawal; all weeks, dates, teams and archived images verified.",
);
