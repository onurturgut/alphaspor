import { z } from "zod";
import {
  checkOrigin,
  fail,
  readJson,
  requireAdmin,
  AdminError,
} from "@/lib/admin/auth";
import { getDb } from "@/lib/mongodb";
import {
  generateFixtures,
  type Competition,
  type Opponent,
} from "@/lib/matches";
import type { AdminRecord } from "@/lib/admin/data";

export const runtime = "nodejs";
const input = z.object({
  competitionId: z.string().min(1).max(100),
  version: z.number().int().min(1),
  startDate: z.iso.date(),
  intervalDays: z.number().int().min(1).max(30),
  returnLeg: z.boolean(),
});

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const user = await requireAdmin();
    const parsed = input.safeParse(await readJson(request));
    if (!parsed.success)
      throw new AdminError(
        "Geçerli başlangıç tarihi ve 1–30 gün arası hafta aralığı girin.",
      );
    const { competitionId, version, startDate, intervalDays, returnLeg } =
      parsed.data;
    const db = await getDb();
    const competition = await db
      .collection<Competition & { _rev: number }>("competitions")
      .findOne({ _id: competitionId, _deleted: { $ne: true } });
    if (!competition) throw new AdminError("Organizasyon bulunamadı.", 404);
    if (competition._rev !== version)
      throw new AdminError("Organizasyon değişti. Sayfayı yenileyin.", 409);
    if (!competition.opponentIds.length)
      throw new AdminError("Fikstür oluşturmak için önce en az bir rakip ekleyin.");
    const opponents = await db
      .collection<Opponent>("opponents")
      .find({ _id: { $in: competition.opponentIds }, _deleted: { $ne: true } })
      .toArray();
    if (opponents.length !== competition.opponentIds.length)
      throw new AdminError("Organizasyonun rakiplerini kontrol edin.");
    const fixtures = generateFixtures(
      competition,
      opponents,
      startDate,
      intervalDays,
      returnLeg,
    );
    const collection = db.collection<AdminRecord>("matches");
    const existingMatches = await collection
      .find({ competitionId })
      .project({ homeId: 1, awayId: 1 })
      .toArray();
    const existingPairs = new Set(
      existingMatches.map((m) => `${m.homeId}:${m.awayId}`),
    );
    const missingFixtures = fixtures.filter(
      (m) => !existingPairs.has(`${m.homeId}:${m.awayId}`),
    );
    if (!missingFixtures.length)
      return Response.json({ ok: true, created: 0, existing: fixtures.length });
    // Deterministic IDs make retries safe; existing results and deleted records are never overwritten.
    const result = await collection.bulkWrite(
      missingFixtures.map((match) => ({
        updateOne: {
          filter: { _id: match.id },
          update: {
            $setOnInsert: {
              ...match,
              _id: match.id,
              _rev: 1,
              order: match.week,
              createdAt: new Date(),
              createdBy: user.id,
            },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );
    return Response.json({
      ok: true,
      created: result.upsertedCount,
      existing: fixtures.length - result.upsertedCount,
    });
  } catch (error) {
    return fail(error);
  }
}
