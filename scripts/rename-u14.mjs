import assert from "node:assert/strict";
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd(), true);
const { getDb, getMongoClient, closeMongoClient } = await import("../src/lib/mongodb.ts");
try {
  const db = await getDb();
  const session = (await getMongoClient()).startSession();
  try {
    await session.withTransaction(async () => {
      const teams = db.collection("teams");
      const old = await teams.findOne({ slug: "u14-u15" }, { session });
      if (old) {
        assert.equal(await teams.countDocuments({ $or: [{ _id: "u14" }, { slug: "u14" }] }, { session }), 0, "U14 already exists");
        await teams.insertOne({ ...old, _id: "u14", slug: "u14", _rev: (old._rev ?? 0) + 1, updatedAt: new Date() }, { session });
        await teams.deleteOne({ _id: old._id }, { session });
      }
      for (const name of ["matches", "matchSources", "competitions"]) {
        await db.collection(name).updateMany({ teamSlug: "u14-u15" }, { $set: { teamSlug: "u14", updatedAt: new Date() }, $inc: { _rev: 1 } }, { session });
      }
      await db.collection("opponents").updateMany({ teamSlugs: "u14-u15" }, { $set: { "teamSlugs.$[team]": "u14", updatedAt: new Date() }, $inc: { _rev: 1 } }, { session, arrayFilters: [{ team: "u14-u15" }] });
      assert.equal(await teams.countDocuments({ _id: "u14", slug: "u14" }, { session }), 1);
    });
    console.log("U14 URL code and related records updated.");
  } finally {
    await session.endSession();
  }
} finally {
  await closeMongoClient();
}
