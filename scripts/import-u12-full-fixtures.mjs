import nextEnv from "@next/env";
import assert from "node:assert/strict";
import { schemas } from "../src/lib/admin/schema.ts";
import {
  competitionId,
  participants,
  fixtureRows,
} from "./data/u12-2026-2027.mjs";

nextEnv.loadEnvConfig(process.cwd());
const { getDb, getMongoClient, closeMongoClient } =
  await import("../src/lib/mongodb.ts");
const apply = process.argv.includes("--apply");

// Validate the transcription before accessing or modifying saved records.
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

try {
  const db = await getDb();
  const competition = await db
    .collection("competitions")
    .findOne({ _id: competitionId, _deleted: { $ne: true } });
  assert(competition, "U12 organizasyonu bulunamadı.");
  assert.equal(competition.teamSlug, "u12");
  assert.equal(competition.season, "2026/2027");
  const opponents = await db
    .collection("opponents")
    .find({ _id: { $in: competition.opponentIds } })
    .toArray();
  assert.deepEqual(
    [...competition.opponentIds].sort(),
    Object.keys(participants)
      .filter((id) => id !== "club")
      .sort(),
  );
  assert.equal(opponents.length, 7);
  assert(opponents.every((r) => !r._deleted));
  const existing = await db
    .collection("matches")
    .find({ competitionId })
    .toArray();
  const changes = [];
  const desired = fixtureRows.map((row) => {
    const found = existing.filter(
      (m) => m.homeId === row.homeId && m.awayId === row.awayId,
    );
    assert(
      found.length <= 1,
      "Aynı ev sahibi/deplasman eşleşmesi birden fazla kez kayıtlı.",
    );
    const before = found[0];
    assert(!before?._deleted, "Silinmiş bir maçı otomatik geri getirmiyoruz.");
    // Preserve original Alfa match IDs and all manually entered scores/reports.
    const id =
      before?._id ??
      `${competitionId}-w${String(row.week).padStart(2, "0")}-${row.homeId}-${row.awayId}`;
    const fixtureFields = {
      week: row.week,
      order: row.order,
      homeTeam: participants[row.homeId],
      awayTeam: participants[row.awayId],
      date: before?.date || row.date,
      time: before?.time || row.time,
      venue: before?.venue || row.venue,
    };
    if (before) {
      if (before.week !== row.week)
        assert(
          before.status === "unreported" && !before.report,
          "Sonuçlu maçın haftası değiştirilemez.",
        );
      const fields = Object.fromEntries(
        Object.entries(fixtureFields).filter(
          ([key, value]) => before[key] !== value,
        ),
      );
      if (Object.keys(fields).length)
        changes.push({ section: "matches", before, fields });
      return { ...before, ...fixtureFields };
    }
    const record = {
      _id: id,
      id,
      ...schemas.matches.parse({
        ...row,
        ...fixtureFields,
        competitionId,
        teamSlug: "u12",
        season: "2026/2027",
        league: competition.name,
        kind: "official",
        status: "unreported",
        homeScore: null,
        awayScore: null,
        note: null,
        report: null,
        published: competition.published, // Continue the existing competition's publication setting.
      }),
    };
    changes.push({ section: "matches", record });
    return record;
  });
  assert(
    existing.every((m) => desired.some((r) => r._id === m._id)),
    "Fikstür dışı mevcut maç var; aktarım durduruldu.",
  );
  for (const opponent of opponents) {
    if (opponent.name !== participants[opponent._id])
      changes.push({
        section: "opponents",
        before: opponent,
        fields: { name: participants[opponent._id] },
      });
  }
  const ruleFields = {
    standingsEnabled: true,
    standingsRule: "tff",
    headToHeadMeetings: 2,
    winPoints: 3,
    drawPoints: 1,
    lossPoints: 0,
  };
  const fields = Object.fromEntries(
    Object.entries(ruleFields).filter(
      ([key, value]) => competition[key] !== value,
    ),
  );
  if (Object.keys(fields).length)
    changes.push({ section: "competitions", before: competition, fields });
  schemas.competitions.parse({ ...competition, ...ruleFields });
  desired.forEach((r) => schemas.matches.parse(r));
  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        existing: existing.length,
        total: desired.length,
        create: changes.filter((r) => r.record).length,
        update: changes
          .filter((r) => r.before)
          .map((r) => ({
            section: r.section,
            id: r.before._id,
            fields: r.fields,
          })),
        recordedResultsPreserved: existing.filter(
          (r) => r.status !== "unreported" || r.report,
        ).length,
      },
      null,
      2,
    ),
  );
  if (apply && changes.length) {
    const session = (await getMongoClient()).startSession();
    try {
      await session.withTransaction(async () => {
        for (const change of changes) {
          const at = new Date();
          if (change.record) {
            await db
              .collection(change.section)
              .insertOne(
                { ...change.record, _rev: 1, createdAt: at, updatedAt: at },
                { session },
              );
          } else {
            const result = await db
              .collection(change.section)
              .updateOne(
                {
                  _id: change.before._id,
                  _rev: change.before._rev ?? { $exists: false },
                },
                {
                  $set: { ...change.fields, updatedAt: at },
                  $inc: { _rev: 1 },
                },
                { session },
              );
            assert.equal(
              result.matchedCount,
              1,
              "Kayıt eşzamanlı değişti; aktarım geri alındı.",
            );
          }
          await db.collection("adminHistory").insertOne(
            {
              section: change.section,
              recordId: change.before?._id ?? change.record._id,
              action: change.before ? "update" : "create",
              userId: "codex:user-request",
              reason:
                "28.09.2026 kullanıcı görsellerinden tam U12 fikstürü ve TFF puan kuralları",
              at,
              before: change.before ?? null,
            },
            { session },
          );
        }
      });
    } finally {
      await session.endSession();
    }
  }
  if (apply) {
    const saved = await db
      .collection("matches")
      .find({ competitionId, _deleted: { $ne: true } })
      .toArray();
    assert.equal(saved.length, 56);
    for (const expected of desired) {
      const actual = saved.find((r) => r._id === expected._id);
      for (const key of [
        "week",
        "homeId",
        "awayId",
        "date",
        "time",
        "venue",
        "homeScore",
        "awayScore",
        "status",
        "published",
        "report",
      ])
        assert.deepEqual(
          actual[key],
          expected[key],
          `Kaydedilen alan uyuşmuyor: ${key}`,
        );
    }
    console.log(
      "56 maç / 14 hafta doğrulandı; mevcut sonuçlar ve yayın ayarları korundu.",
    );
  }
} catch (error) {
  console.error(
    error instanceof assert.AssertionError
      ? error.message
      : `Aktarım başarısız (${error?.name ?? "hata"}); hiçbir gizli bağlantı bilgisi yazdırılmadı.`,
  );
  process.exitCode = 1;
} finally {
  await closeMongoClient();
}
