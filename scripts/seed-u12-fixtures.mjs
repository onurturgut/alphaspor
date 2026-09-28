import nextEnv from "@next/env";
import assert from "node:assert/strict";
import { schemas } from "../src/lib/admin/schema.ts";

nextEnv.loadEnvConfig(process.cwd());
const { getDb, closeMongoClient } = await import("../src/lib/mongodb.ts");
const competitionId = "u12-2026-2027";
// Source: user-provided 2026–2027 U12 fixture poster, 27 September 2026.
const names = [
  ["seydikemer-spor", "SEYDİKEMER SPOR"],
  ["camkoyspor", "ÇAMKÖYSPOR"],
  ["likya-spor", "LİKYA SPOR"],
  ["1925-menteseogluspor", "1925 MENTEŞEOĞLUSPOR"],
  ["eldirek-gucuspor", "ELDİREKGÜCÜSPOR"],
  ["karaculhaspor", "KARAÇULHASPOR"],
  ["arsa-spor", "ARSA SPOR"],
];
const normalize = (name) =>
  name.toLocaleUpperCase("tr-TR").replace(/[^\p{L}\p{N}]/gu, "");

try {
  const db = await getDb();
  assert(
    await db
      .collection("teams")
      .findOne({ slug: "u12", _deleted: { $ne: true } }),
    "U12 team missing",
  );
  const existingOpponents = await db.collection("opponents").find({}).toArray();
  const opponents = names.map(([id, name], order) => {
    const matches = existingOpponents.filter(
      (item) => item._id === id || normalize(item.name) === normalize(name),
    );
    assert(
      matches.length <= 1 && !matches[0]?._deleted,
      "Conflicting opponent record",
    );
    return (
      matches[0] ?? { _id: id, ...schemas.opponents.parse({ name, order }) }
    );
  });
  const competition = {
    _id: competitionId,
    ...schemas.competitions.parse({
      name: "U12 Ligi",
      teamSlug: "u12",
      season: "2026/2027",
      kind: "official",
      clubName: "FETHİYE ALFA SPOR",
      opponentIds: opponents.map((item) => item._id),
      // Existing editor defaults, not rules supplied by the poster.
      // Editable until a match report uses them.
      duration: 90,
      starterCount: 11,
      allowReentry: false,
      standingsEnabled: true,
      winPoints: 3,
      drawPoints: 1,
      lossPoints: 0,
      published: false,
      order: 0,
    }),
  };
  const fixtures = Array.from({ length: 14 }, (_, index) => {
    const opponent = opponents[index % 7];
    const home = index % 2 === 0;
    const id = `${competitionId}-${String(index + 1).padStart(2, "0")}`;
    return {
      _id: id,
      id,
      ...schemas.matches.parse({
        competitionId,
        teamSlug: "u12",
        league: competition.name,
        season: competition.season,
        kind: "official",
        week: index + 1,
        date: "",
        time: null,
        venue: null,
        note: null,
        homeId: home ? "club" : opponent._id,
        awayId: home ? opponent._id : "club",
        homeTeam: home ? competition.clubName : opponent.name,
        awayTeam: home ? opponent.name : competition.clubName,
        homeScore: null,
        awayScore: null,
        status: "unreported",
        published: false,
        report: null,
        order: index,
      }),
    };
  });
  const existingCompetition = await db
    .collection("competitions")
    .findOne({ _id: competitionId });
  assert(!existingCompetition?._deleted, "Competition previously deleted");
  if (existingCompetition) {
    assert.deepEqual(existingCompetition.opponentIds, competition.opponentIds);
  }
  const existingFixtures = await db
    .collection("matches")
    .find({ teamSlug: "u12", season: "2026/2027" })
    .toArray();
  for (const match of existingFixtures) {
    const expected = fixtures.find((item) => item._id === match._id);
    assert(
      expected && !match._deleted,
      "Unexpected existing fixture; inspect before importing",
    );
    for (const key of ["competitionId", "week", "homeId", "awayId"])
      assert.equal(match[key], expected[key], `Fixture mismatch: ${key}`);
  }
  for (const [section, records] of [
    ["opponents", opponents],
    ["competitions", [competition]],
    ["matches", fixtures],
  ]) {
    const result = await db.collection(section).bulkWrite(
      records.map((record) => ({
        updateOne: {
          filter: { _id: record._id },
          update: {
            $setOnInsert: {
              ...record,
              _rev: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
          upsert: true,
        },
      })),
    );
    assert.equal(
      await db
        .collection(section)
        .countDocuments({ _id: { $in: records.map((r) => r._id) } }),
      records.length,
    );
    console.log(
      `${section}: ${result.upsertedCount} yeni, ${records.length - result.upsertedCount} mevcut kayıt korundu.`,
    );
  }
  const saved = await db
    .collection("matches")
    .find({ competitionId })
    .sort({ week: 1 })
    .toArray();
  assert.equal(saved.length, 14);
  for (let i = 0; i < 7; i++) {
    assert.equal(saved[i].homeId, saved[i + 7].awayId);
    assert.equal(saved[i].awayId, saved[i + 7].homeId);
  }
  console.log("U12: 7 rakip ve 14 haftalık rövanşlı fikstür doğrulandı.");
} catch (error) {
  console.error(
    error instanceof assert.AssertionError
      ? error.message
      : "U12 aktarımı başarısız; bağlantı ve kayıtları kontrol edin.",
  );
  process.exitCode = 1;
} finally {
  await closeMongoClient();
}
