import "server-only";
import { randomUUID } from "node:crypto";
import { getDb } from "../mongodb";
import { AdminError } from "./auth";
import { schemas, type Section } from "./schema";
import {
  reportScore,
  validateReport,
  type Match,
  type Competition,
  type Opponent,
} from "../matches";
import type { AcademyPlayer } from "../academy";
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
  const records = await collection
    .find({ _deleted: { $ne: true } })
    .sort({ order: 1, _id: 1 })
    .limit(2000)
    .toArray();
  if (section === "opponents") {
    const competitions = await (
      await getDb()
    )
      .collection<Competition>("competitions")
      .find({ _deleted: { $ne: true } })
      .toArray();
    return records.map((record) => ({
      ...record,
      teamSlugs: record.teamSlugs ?? [
        ...new Set(
          competitions
            .filter((c) => c.opponentIds.includes(record._id))
            .map((c) => c.teamSlug),
        ),
      ],
    }));
  }
  return records;
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
  if (section === "opponents") {
    const slugs = fields.teamSlugs as string[];
    if (
      new Set(slugs).size !== slugs.length ||
      (await db
        .collection("teams")
        .countDocuments({ slug: { $in: slugs }, _deleted: { $ne: true } })) !==
        slugs.length
    )
      throw new AdminError("Geçerli yaş grupları seçin.");
    if (recordId) {
      const used = await db
        .collection("competitions")
        .find({ opponentIds: recordId, _deleted: { $ne: true } })
        .toArray();
      const previous = await collection.findOne({ _id: recordId });
      if (
        used.some(
          (c) =>
            (previous?.teamSlugs as string[] | undefined)?.includes(
              c.teamSlug,
            ) && !slugs.includes(c.teamSlug),
        )
      )
        throw new AdminError(
          "Organizasyonda kullanılan yaş grubu kaldırılamaz.",
        );
    }
  }
  if (section === "teams") {
    if (recordId && fields.slug !== recordId)
      throw new AdminError("Mevcut takımın URL kodu değiştirilemez.");
    fields.playerCount = (fields.players as unknown[]).length;
    const ids = new Set((fields.players as AcademyPlayer[]).map((p) => p.id));
    const reports = await db
      .collection<Match>("matches")
      .find({
        teamSlug: fields.slug as string,
        _deleted: { $ne: true },
        report: { $ne: null },
      })
      .toArray();
    if (
      reports.some((m) =>
        [...(m.report?.starters ?? []), ...(m.report?.bench ?? [])].some(
          (id) => !ids.has(id),
        ),
      )
    )
      throw new AdminError(
        "Maç kadrosunda kullanılan oyuncu silinemez. Önce ilgili maç kadrosunu düzenleyin.",
      );
    if (
      (fields.players as AcademyPlayer[]).some((p) =>
        p.appearances?.some((a) => a.id.startsWith("match:")),
      )
    )
      throw new AdminError(
        "Otomatik maç kayıtları oyuncu formundan değiştirilemez.",
      );
  }
  if (section === "competitions") {
    if (
      !(await db
        .collection("teams")
        .findOne({ slug: fields.teamSlug, _deleted: { $ne: true } }))
    )
      throw new AdminError("Mevcut bir takım seçin.");
    const ids = fields.opponentIds as string[];
    const selectedOpponents = await db
      .collection<Opponent>("opponents")
      .find({ _id: { $in: ids }, _deleted: { $ne: true } })
      .toArray();
    const existingCompetition = recordId
      ? await db
          .collection<Competition>("competitions")
          .findOne({ _id: recordId })
      : null;
    for (const opponent of selectedOpponents) {
      const inherited =
        !opponent.teamSlugs &&
        (await db
          .collection("competitions")
          .findOne({
            opponentIds: opponent._id,
            teamSlug: fields.teamSlug,
            _deleted: { $ne: true },
          }));
      if (
        !opponent.teamSlugs?.includes(String(fields.teamSlug)) &&
        !inherited &&
        !(
          existingCompetition &&
          existingCompetition.teamSlug === fields.teamSlug &&
          existingCompetition.opponentIds.includes(opponent._id)
        )
      )
        throw new AdminError("Rakipleri önce seçilen yaş grubuna atayın.");
    }
    if (
      (await db
        .collection<Opponent>("opponents")
        .countDocuments({ _id: { $in: ids }, _deleted: { $ne: true } })) !==
      ids.length
    )
      throw new AdminError("Geçerli rakipler seçin.");
    if (
      recordId &&
      (await db
        .collection("matches")
        .countDocuments({ competitionId: recordId, _deleted: { $ne: true } }))
    ) {
      const existing = await db
        .collection<AdminRecord>("competitions")
        .findOne({ _id: recordId });
      for (const key of ["name", "teamSlug", "season", "kind", "clubName"]) {
        if (JSON.stringify(existing?.[key]) !== JSON.stringify(fields[key]))
          throw new AdminError(
            "Maçları olan organizasyonun temel bilgileri değiştirilemez. Yeni organizasyon oluşturun veya önce maçlarını kaldırın.",
          );
      }
      const previousOpponentIds = (existing?.opponentIds ?? []) as string[];
      if (previousOpponentIds.some((id) => !ids.includes(id)))
        throw new AdminError(
          "Maçları olan organizasyondan mevcut rakipler çıkarılamaz; ancak yeni rakip ekleyebilirsiniz.",
        );
      const hasReports = await db.collection("matches").countDocuments({
        competitionId: recordId,
        _deleted: { $ne: true },
        report: { $ne: null },
      });
      if (
        hasReports &&
        ["duration", "starterCount", "allowReentry"].some(
          (key) => existing?.[key] !== fields[key],
        )
      )
        throw new AdminError(
          "Maç raporu olan organizasyonun oyun kuralları değiştirilemez.",
        );
    }
  }
  if (section === "matches") {
    const team = await db
      .collection<{ players: AcademyPlayer[] }>("teams")
      .findOne({ slug: fields.teamSlug, _deleted: { $ne: true } });
    if (!team) throw new AdminError("Maç için mevcut bir takım seçin.");
    if (fields.competitionId) {
      const competition = await db
        .collection<Competition>("competitions")
        .findOne({
          _id: String(fields.competitionId),
          _deleted: { $ne: true },
        });
      if (!competition) throw new AdminError("Organizasyon bulunamadı.");
      const participantIds = ["club", ...competition.opponentIds];
      const customHome =
        competition.kind === "friendly" && fields.homeId === "custom-home";
      const customAway =
        competition.kind === "friendly" && fields.awayId === "custom-away";
      if (
        (!customHome && !participantIds.includes(String(fields.homeId))) ||
        (!customAway && !participantIds.includes(String(fields.awayId)))
      )
        throw new AdminError(
          "Takımlar organizasyon katılımcılarından seçilmeli.",
        );
      if (
        (customHome || customAway) &&
        fields.homeId !== "club" &&
        fields.awayId !== "club"
      )
        throw new AdminError(
          "Tek seferlik rakip yalnızca kulübümüzün hazırlık maçında kullanılabilir.",
        );
      const opponents = await db
        .collection<Opponent>("opponents")
        .find({
          _id: { $in: competition.opponentIds },
          _deleted: { $ne: true },
        })
        .toArray();
      const name = (id: unknown) =>
        id === "club"
          ? competition.clubName
          : id === "custom-home"
            ? String(fields.homeTeam || "").trim()
            : id === "custom-away"
              ? String(fields.awayTeam || "").trim()
              : opponents.find((o) => o._id === id)?.name;
      if (!name(fields.homeId) || !name(fields.awayId))
        throw new AdminError("Rakip bulunamadı.");
      if (fields.teamSlug !== competition.teamSlug)
        throw new AdminError("Takım organizasyonla uyuşmuyor.");
      Object.assign(fields, {
        league: competition.name,
        season: competition.season,
        kind: competition.kind,
        homeTeam: name(fields.homeId),
        awayTeam: name(fields.awayId),
      });
      const report = fields.report as Match["report"];
      if (
        report &&
        (report.starterCount !== competition.starterCount ||
          report.allowReentry !== competition.allowReentry ||
          report.duration < competition.duration)
      )
        throw new AdminError(
          "Kadro ve süre organizasyon kurallarıyla uyuşmuyor.",
        );
    } else {
      fields.homeId = null;
      fields.awayId = null;
    }
    const report = fields.report as Match["report"];
    if (report) {
      if (fields.status === "played") {
        const score = reportScore(report);
        fields.homeScore = score.home;
        fields.awayScore = score.away;
      }
      const errors = validateReport(fields as unknown as Match, team.players);
      if (errors.length) throw new AdminError(errors.slice(0, 4).join(" · "));
      report.playerNames = Object.fromEntries(
        team.players
          .filter((p) => [...report.starters, ...report.bench].includes(p.id))
          .map((p) => [p.id, p.name]),
      );
      report.playerPhotos = Object.fromEntries(
        team.players
          .filter(
            (p) =>
              [...report.starters, ...report.bench].includes(p.id) && p.photo,
          )
          .map((p) => [p.id, p.photo]),
      );
    }
  }
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
    await db.collection("adminHistory").insertOne({
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
  if (
    section === "opponents" &&
    (await db
      .collection("competitions")
      .countDocuments({ opponentIds: id, _deleted: { $ne: true } }))
  )
    throw new AdminError("Organizasyonda kullanılan rakip silinemez.");
  if (
    section === "competitions" &&
    (await db
      .collection("matches")
      .countDocuments({ competitionId: id, _deleted: { $ne: true } }))
  )
    throw new AdminError("Önce organizasyonun maçlarını kaldırın.");
  if (
    section === "teams" &&
    (await db
      .collection("competitions")
      .countDocuments({ teamSlug: id, _deleted: { $ne: true } }))
  )
    throw new AdminError("Organizasyonda kullanılan takım silinemez.");
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
  await db.collection("adminHistory").insertOne({
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
