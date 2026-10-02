import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd(), true);
const { getDb, getMongoClient, closeMongoClient } = await import("../src/lib/mongodb.ts");
const { schemas } = await import("../src/lib/admin/schema.ts");

// Transcribed from the user's 14 weekly fixture screenshots, 2026/2027.
const ids = { A: "club", L: "likya-spor", G: "gunlukbasispor", M: "1925-menteseogluspor", E: "eldirek-gucuspor", K: "karaculhaspor", S: "seydikemer-spor" };
const names = { A: "FETHİYE ALFA SPOR", L: "LİKYA SPOR", G: "GÜNLÜKBAŞISPOR", M: "1925 MENTEŞEOĞLUSPOR", E: "FETHİYE ELDİREKGÜCÜSPOR", K: "KARAÇULHASPOR", S: "SEYDİKEMER SPOR" };
const rounds = [
  ["LG", "AE", "MK"], ["SA", "KL", "EM"],
  ["GK", "MS", "LE"], ["AM", "EG", "SL"],
  ["KE", "LA", "GS"], ["ML", "SK", "AG"],
  ["ES", "GM", "KA"], ["GL", "EA", "KM"],
  ["AS", "LK", "ME"], ["KG", "SM", "EL"],
  ["MA", "GE", "LS"], ["EK", "AL", "SG"],
  ["LM", "KS", "GA"], ["SE", "MG", "AK"],
];
const byes = ["S", "G", "A", "K", "M", "E", "L", "S", "G", "A", "K", "M", "E", "L"];
const venue = (home) => ({ A: "ESENKÖY", S: "SEYDİKEMER", K: "KARAÇULHA" })[home] ?? "FETHİYE SENTETİK";
assert.equal(new Set(rounds.flat()).size, 42);
rounds.forEach((pairs, i) => {
  const participants = pairs.join("").split("");
  assert.equal(new Set(participants).size, 6);
  assert.equal(participants.includes(byes[i]), false);
});
for (const pair of rounds.flat()) assert.ok(rounds.flat().includes([...pair].reverse().join("")));

try {
  const db = await getDb();
  const competitions = await db.collection("competitions").find({ teamSlug: "u14", season: "2026/2027", _deleted: { $ne: true } }).toArray();
  assert.equal(competitions.length, 1, "Expected exactly one existing U14 organization");
  const competition = competitions[0];
  const existing = await db.collection("matches").find({ competitionId: competition._id }).toArray();
  assert.equal(existing.length, 0, "Organization already has fixtures; refusing to overwrite");
  const opponentIds = Object.values(ids).filter((id) => id !== "club");
  const previousOpponents = await db.collection("opponents").find({ _id: { $in: opponentIds } }).toArray();
  mkdirSync(".local-backups", { recursive: true });
  writeFileSync(`.local-backups/u14-fixtures-${Date.now()}.json`, JSON.stringify({ competition, opponents: previousOpponents, matches: existing }, null, 2));
  const fixtures = rounds.flatMap((pairs, round) => pairs.map(([home, away], position) => {
    const id = `${competition._id}-w${round + 1}-${ids[home]}-${ids[away]}`;
    const data = schemas.matches.parse({
      competitionId: competition._id, homeId: ids[home], awayId: ids[away],
      kind: competition.kind, published: false, report: null,
      teamSlug: "u14", league: competition.name, season: competition.season,
      week: round + 1, date: round === 0 ? "2026-10-25" : "", time: round === 0 ? "15:00" : null,
      homeTeam: home === "A" ? competition.clubName : names[home], awayTeam: away === "A" ? competition.clubName : names[away],
      homeScore: null, awayScore: null, status: "unreported", venue: venue(home), note: null,
      order: round * 3 + position,
    });
    return { ...data, _id: id, id, _rev: 1, createdAt: new Date(), updatedAt: new Date() };
  }));
  const session = (await getMongoClient()).startSession();
  try {
    await session.withTransaction(async () => {
      assert.equal(await db.collection("matches").countDocuments({ competitionId: competition._id }, { session }), 0);
      for (const [key, id] of Object.entries(ids)) {
        if (id === "club") continue;
        const old = await db.collection("opponents").findOne({ _id: id }, { session });
        assert.ok(!old?._deleted, "Opponent is deleted");
        const inherited = old?.teamSlugs ?? await db.collection("competitions").distinct("teamSlug", { opponentIds: id, _deleted: { $ne: true } }, { session });
        await db.collection("opponents").updateOne({ _id: id }, {
          $set: { teamSlugs: [...new Set([...inherited, "u14"])], updatedAt: new Date() },
          $setOnInsert: { name: names[key], order: 7, createdAt: new Date() }, $inc: { _rev: 1 },
        }, { upsert: true, session });
      }
      const updated = await db.collection("competitions").updateOne({ _id: competition._id, _rev: competition._rev }, {
        $set: { opponentIds, updatedAt: new Date() }, $inc: { _rev: 1 },
      }, { session });
      assert.equal(updated.modifiedCount, 1, "Organization changed during import");
      await db.collection("matches").insertMany(fixtures, { session });
    });
  } finally { await session.endSession(); }
  const saved = await db.collection("matches").find({ competitionId: competition._id }).sort({ order: 1 }).toArray();
  assert.equal(saved.length, 42);
  saved.forEach((match, i) => {
    for (const key of ["week", "homeId", "awayId", "venue", "date", "time", "published"]) assert.equal(match[key], fixtures[i][key]);
    schemas.matches.parse(match);
  });
  assert.equal(saved.filter((m) => m.homeId === "club" || m.awayId === "club").length, 12);
  console.log("PASS: 42 fixtures, 14 weeks, 12 Alfa matches; all venues, dates, times and bye weeks verified. Saved as drafts in " + competition.name);
} finally { await closeMongoClient(); }
