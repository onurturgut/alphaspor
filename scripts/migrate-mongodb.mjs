import nextEnv from "@next/env";
import { readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";

nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
const { getDb, closeMongoClient } = await import("../src/lib/mongodb.ts");
const read = async (name) =>
  JSON.parse(
    await readFile(
      new URL(`../src/data/${name}.json`, import.meta.url),
      "utf8",
    ),
  );

try {
  const content = await read("content");
  const matches = (
    await Promise.all(
      ["u11", "u12", "u13", "u14"].map((team) => read(`matches-${team}`)),
    )
  ).flat();
  const sources = await read("match-sources");
  const db = await getDb();
  const datasets = [
    [
      "teams",
      content.teams.map((item, order) => ({ ...item, _id: item.slug, order })),
    ],
    [
      "news",
      content.news.map((item, order) => ({ ...item, _id: item.id, order })),
    ],
    [
      "staff",
      content.staff.map((item, order) => ({
        ...item,
        _id: `staff-${order}`,
        order,
      })),
    ],
    [
      "settings",
      [{ _id: "club", about: content.about, contact: content.contact }],
    ],
    [
      "matches",
      matches.map((item, order) => ({ ...item, _id: item.id, order })),
    ],
    [
      "matchSources",
      sources.map((item, order) => ({
        ...item,
        _id: `${item.teamSlug}-${item.season}`,
        order,
      })),
    ],
  ];
  // Existing records are preserved, including later editorial changes.
  for (const [name, documents] of datasets) {
    if (new Set(documents.map((item) => item._id)).size !== documents.length)
      throw new Error("Duplicate source IDs");
    const collection = db.collection(name);
    const result = await collection.bulkWrite(
      documents.map((document) => ({
        updateOne: {
          filter: { _id: document._id },
          update: { $setOnInsert: document },
          upsert: true,
        },
      })),
    );
    const saved = await collection
      .find({ _id: { $in: documents.map((item) => item._id) } })
      .toArray();
    if (saved.length !== documents.length)
      throw new Error("Migration count mismatch");
    const differences = saved.filter(
      (item) =>
        !isDeepStrictEqual(
          item,
          documents.find((source) => source._id === item._id),
        ),
    ).length;
    console.log(
      `${name}: ${saved.length} kayıt doğrulandı; ${result.upsertedCount} yeni; ${differences} mevcut değiştirilmiş kayıt korundu.`,
    );
  }
  console.log(
    `Kadrolar: ${content.teams.reduce((count, team) => count + team.players.length, 0)} oyuncu kaydı takım belgelerinde saklanıyor.`,
  );
} catch {
  console.error(
    "MongoDB aktarımı başarısız. Bağlantıyı ve veritabanı yazma yetkisini kontrol edin. Komut güvenle tekrar çalıştırılabilir.",
  );
  process.exitCode = 1;
} finally {
  await closeMongoClient();
}
