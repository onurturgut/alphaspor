import "server-only";
import { randomUUID } from "node:crypto";
import { getDb } from "../mongodb";
import { AdminError } from "./auth";
import { schemas, type Section } from "./schema";
import {
  defaultGallery,
  defaultHome,
  defaultPages,
  defaultValues,
} from "../site-settings";

export type AdminRecord = {
  _id: string;
  _rev?: number;
  _deleted?: boolean;
  [key: string]: unknown;
};
export function sectionKey(section: string): Section {
  if (!Object.hasOwn(schemas, section))
    throw new AdminError("Bölüm bulunamadı.", 404);
  return section as Section;
}
export function settingsDefaults(record: AdminRecord) {
  return {
    ...record,
    home: { ...defaultHome, ...((record.home as object) ?? {}) },
    pages: { ...defaultPages, ...((record.pages as object) ?? {}) },
    values: record.values ?? defaultValues,
    gallery: record.gallery ?? defaultGallery,
  };
}
export async function listAdmin(section: Section) {
  const collection = (await getDb()).collection<AdminRecord>(section);
  if (section === "settings") {
    const record = await collection.findOne({ _id: "club" });
    if (!record) throw new AdminError("Kulüp ayarları bulunamadı.", 404);
    return [settingsDefaults(record)];
  }
  return collection
    .find({ _deleted: { $ne: true } })
    .sort({ order: 1, _id: 1 })
    .limit(2000)
    .toArray();
}
export async function saveAdmin(
  section: Section,
  payload: unknown,
  userId: string,
) {
  if (!payload || typeof payload !== "object")
    throw new AdminError("Geçersiz kayıt.");
  const { id, version, data } = payload as Record<string, unknown>;
  if (id !== null && (typeof id !== "string" || id.length > 150))
    throw new AdminError("Geçersiz kayıt kimliği.");
  if (version !== null && (!Number.isInteger(version) || Number(version) < 0))
    throw new AdminError("Geçersiz kayıt sürümü.");
  const parsed = schemas[section].safeParse(data);
  if (!parsed.success)
    throw new AdminError(
      parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .slice(0, 4)
        .join(" · "),
    );
  const db = await getDb();
  const collection = db.collection<AdminRecord>(section);
  const fields: Record<string, unknown> = { ...parsed.data };
  const recordId = id as string | null;
  if (section === "settings" && recordId !== "club")
    throw new AdminError("Geçersiz ayar kaydı.");
  if (section === "teams") {
    if (recordId && fields.slug !== recordId)
      throw new AdminError("Mevcut takımın URL kodu değiştirilemez.");
    fields.playerCount = (fields.players as unknown[]).length;
  }
  if (
    section === "matches" &&
    !(await db
      .collection("teams")
      .findOne({ slug: fields.teamSlug, _deleted: { $ne: true } }))
  )
    throw new AdminError("Maç için mevcut bir takım seçin.");
  const key =
    recordId ?? (section === "teams" ? String(fields.slug) : randomUUID());
  if (section === "news" || section === "matches") fields.id = key;
  const previous = recordId
    ? await collection.findOne({ _id: key, _deleted: { $ne: true } })
    : null;
  if (recordId && !previous) throw new AdminError("Kayıt bulunamadı.", 404);
  if (previous && (previous._rev ?? null) !== version)
    throw new AdminError(
      "Bu kayıt başka bir oturumda değişti. Sayfayı yenileyip tekrar deneyin.",
      409,
    );
  if (previous)
    await db
      .collection("adminHistory")
      .insertOne({
        section,
        recordId: key,
        action: "update",
        userId,
        at: new Date(),
        before: previous,
      });
  const updated = {
    ...fields,
    _rev: Number(version ?? 0) + 1,
    updatedAt: new Date(),
  };
  if (previous) {
    const result = await collection.updateOne(
      {
        _id: key,
        _deleted: { $ne: true },
        _rev: version === null ? { $exists: false } : Number(version),
      },
      { $set: updated },
    );
    if (!result.matchedCount)
      throw new AdminError("Kayıt değişti; sayfayı yenileyin.", 409);
  } else {
    try {
      await collection.insertOne({
        _id: key,
        ...updated,
        createdAt: new Date(),
      });
    } catch (error) {
      if ((error as { code?: number }).code === 11000)
        throw new AdminError("Bu URL kodu zaten kullanılıyor.", 409);
      throw error;
    }
  }
  return key;
}
export async function deleteAdmin(
  section: Section,
  payload: unknown,
  userId: string,
) {
  if (section === "settings") throw new AdminError("Sayfa ayarları silinemez.");
  const { id, version } = (payload ?? {}) as Record<string, unknown>;
  if (typeof id !== "string" || id.length > 150)
    throw new AdminError("Geçersiz kayıt.");
  const db = await getDb();
  const collection = db.collection<AdminRecord>(section);
  const previous = await collection.findOne({
    _id: id,
    _deleted: { $ne: true },
  });
  if (!previous) throw new AdminError("Kayıt bulunamadı.", 404);
  if ((previous._rev ?? null) !== version)
    throw new AdminError("Kayıt değişti; sayfayı yenileyin.", 409);
  if (
    section === "teams" &&
    (await db
      .collection("matches")
      .countDocuments({ teamSlug: id, _deleted: { $ne: true } }))
  )
    throw new AdminError(
      "Bu takımın maçları var. Önce maçları başka takıma bağlayın veya silin.",
    );
  await db
    .collection("adminHistory")
    .insertOne({
      section,
      recordId: id,
      action: "delete",
      userId,
      at: new Date(),
      before: previous,
    });
  const result = await collection.updateOne(
    { _id: id, _rev: version === null ? { $exists: false } : Number(version) },
    {
      $set: {
        _deleted: true,
        _rev: Number(version ?? 0) + 1,
        updatedAt: new Date(),
      },
    },
  );
  if (!result.matchedCount)
    throw new AdminError("Kayıt değişti; sayfayı yenileyin.", 409);
}
