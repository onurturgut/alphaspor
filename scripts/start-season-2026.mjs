import nextEnv from "@next/env";
import assert from "node:assert/strict";

nextEnv.loadEnvConfig(process.cwd());
const { getDb, closeMongoClient } = await import("../src/lib/mongodb.ts");
try {
  const db = await getDb();
  const competitionId = "u12-2026-2027";
  const competition = await db
    .collection("competitions")
    .findOne({ _id: competitionId, _deleted: { $ne: true } });
  const fixtures = await db
    .collection("matches")
    .find({ competitionId, _deleted: { $ne: true } })
    .toArray();
  assert(competition?.standingsEnabled, "U12 puan tablosu hazır değil.");
  assert.equal(fixtures.length, 14);
  const settings = await db.collection("settings").findOne({ _id: "club" });
  assert(settings, "Site ayarları bulunamadı.");
  async function change(section, before, fields) {
    await db.collection("adminHistory").insertOne({
      section,
      recordId: before._id,
      action: "update",
      userId: "codex:user-request",
      reason: "2026/2027 sezon başlangıcı",
      at: new Date(),
      before,
    });
    const result = await db
      .collection(section)
      .updateOne(
        { _id: before._id, _rev: before._rev ?? { $exists: false } },
        { $set: { ...fields, updatedAt: new Date() }, $inc: { _rev: 1 } },
      );
    assert.equal(
      result.matchedCount,
      1,
      "Kayıt değişmiş; yeniden kontrol edin.",
    );
  }
  for (const section of ["matches", "competitions", "matchSources"]) {
    const old = await db
      .collection(section)
      .find({ season: "2025/2026", _deleted: { $ne: true } })
      .toArray();
    for (const record of old) await change(section, record, { _deleted: true });
    console.log(
      `${section}: ${old.length} eski sezon kaydı aktif listeden kaldırıldı.`,
    );
  }
  if (!competition.published)
    await change("competitions", competition, { published: true });
  for (const match of fixtures)
    if (!match.published) await change("matches", match, { published: true });
  if (settings.home?.resultsSeason !== "2026/2027")
    await change("settings", settings, { "home.resultsSeason": "2026/2027" });
  assert.equal(
    await db
      .collection("matches")
      .countDocuments({ season: "2025/2026", _deleted: { $ne: true } }),
    0,
  );
  assert.equal(
    await db
      .collection("matches")
      .countDocuments({
        competitionId,
        published: true,
        _deleted: { $ne: true },
      }),
    14,
  );
  console.log(
    "Yeni sezon: 14 U12 maçı ve puan tablosu yayında; varsayılan sezon 2026/2027.",
  );
} catch (error) {
  console.error(
    error instanceof assert.AssertionError
      ? error.message
      : "Sezon geçişi tamamlanamadı; bağlantı ve kayıtları kontrol edin.",
  );
  process.exitCode = 1;
} finally {
  await closeMongoClient();
}
