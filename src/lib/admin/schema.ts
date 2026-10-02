import { z } from "zod";

/** Turkish names converted to stable, URL-safe identifiers. */
export function slugify(value: string): string {
  return value.trim().replace(/İ/g, "I").replace(/ı/g, "i")
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const text = (max = 250) => z.string().trim().max(max);
const required = (max = 250) => text(max).min(1, "Bu alan zorunlu.");
export const safeUrl = text(2048).refine((value) => {
  if (!value) return true;
  if (/^\/(?!\/)/.test(value) && !/[\\\s]/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}, "Yerel yol veya geçerli HTTPS adresi girin.");
const order = z.number().int().min(-10000).max(10000).default(0);
const season = required(9).regex(
  /^\d{4}\/\d{4}$/,
  "Sezon 2026/2027 biçiminde olmalı.",
);
const slug = required(80).regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  "Yalnızca küçük harf, rakam ve tire kullanın.",
);
const date = required(10)
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const d = new Date(`${v}T12:00:00Z`);
    return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }, "Geçerli tarih girin.");
const optionalCount = (max: number) =>
  z.number().int().min(0).max(max).nullable();
const minute = z.number().int().min(0).max(150);
const matchReportSchema = z.object({
  clubSide: z.enum(["home", "away"]),
  duration: z.number().int().min(1).max(150),
  starterCount: z.number().int().min(1).max(11),
  allowReentry: z.boolean(),
  starters: z.array(required(100)).max(11),
  bench: z.array(required(100)).max(50),
  events: z
    .array(
      z.discriminatedUnion("type", [
        z.object({
          id: required(100),
          type: z.literal("goal"),
          minute,
          side: z.enum(["home", "away"]),
          playerId: required(100).nullable(),
          assistId: required(100).nullable(),
          kind: z.enum(["normal", "penalty", "own"]),
        }),
        z.object({
          id: required(100),
          type: z.literal("substitution"),
          minute,
          outId: required(100),
          inId: required(100),
        }),
      ]),
    )
    .max(300),
});
export const appearanceSchema = z.object({
  id: required(100),
  season,
  date,
  opponent: required(150),
  kind: z.enum(["official", "friendly", "tournament"]),
  goals: optionalCount(99),
  assists: optionalCount(99),
  minutes: optionalCount(150),
  started: z.boolean().nullable(),
  saves: optionalCount(150).optional(),
  cleanSheet: z.boolean().nullable().optional(),
});
export const playerSchema = z
  .object({
    id: required(100),
    name: required(120),
    position: required(100),
    photo: safeUrl,
    placeholder: z.boolean().default(false),
    shirtNumber: optionalCount(99).optional(),
    foot: z.enum(["right", "left", "both", ""]).optional(),
    goal: text(500).optional(),
    strength: text(500).optional(),
    appearances: z.array(appearanceSchema).max(400).optional(),
  })
  .superRefine((player, ctx) => {
    const rows = player.appearances ?? [];
    if (new Set(rows.map((row) => row.id)).size !== rows.length)
      ctx.addIssue({
        code: "custom",
        path: ["appearances"],
        message: "Maç kayıt kimlikleri benzersiz olmalı.",
      });
    const keys = rows.map(
      (row) =>
        `${row.season}|${row.date}|${row.kind}|${row.opponent.toLocaleLowerCase("tr-TR")}`,
    );
    if (new Set(keys).size !== keys.length)
      ctx.addIssue({
        code: "custom",
        path: ["appearances"],
        message: "Aynı tarih, rakip ve maç türü için tekrar kayıt eklemeyin.",
      });
  });
const intro = z.object({
  title: required(),
  eyebrow: text(),
  description: text(1000),
});
export const settingsSchema = z
  .object({
    about: required(30000),
    contact: z.object({
      email: z.email().max(254),
      phone: required(50),
      address: required(500),
      hours: text(500),
      instagram: safeUrl,
    }),
    home: z.object({
      eyebrow: text(),
      title: required(),
      titleAccent: text(),
      description: text(1500),
      primaryLabel: required(),
      primaryHref: safeUrl,
      secondaryLabel: required(),
      secondaryHref: safeUrl,
      aboutTitle: required(),
      aboutSubtitle: text(),
      teamsTitle: required(),
      newsTitle: required(),
      staffTitle: required(),
      joinTitle: required(),
      joinSubtitle: text(),
      joinDescription: text(1500),
      resultsSeason: season,
    }),
    pages: z.object({
      club: intro,
      teams: intro,
      news: intro,
      matches: intro,
      contact: intro,
    }),
    values: z.array(z.object({ title: required(), text: text(500) })).length(3),
    gallery: z
      .array(
        z.object({
          id: required(100),
          src: safeUrl.refine(Boolean, "Görsel seçin."),
          alt: required(300),
          width: z.number().int().min(1).max(12000),
          height: z.number().int().min(1).max(12000),
        }),
      )
      .max(50),
    heroVideo: z
      .object({
        desktop: safeUrl,
        mobile: safeUrl,
        poster: safeUrl,
        mobilePoster: safeUrl,
      })
      .optional(),
  })
  .superRefine((value, ctx) => {
    for (const field of ["primaryHref", "secondaryHref"] as const) {
      if (!safeUrl.safeParse(value.home[field]).success)
        ctx.addIssue({
          code: "custom",
          path: ["home", field],
          message: "Güvenli bağlantı girin.",
        });
    }
  });
export const schemas = {
  opponents: z.object({ name: required(150), teamSlugs: z.array(slug).max(30).default([]), order }),
  competitions: z.object({
    name: required(100),
    teamSlug: slug,
    season,
    kind: z.enum(["official", "friendly", "tournament"]),
    clubName: required(150),
    opponentIds: z
      .array(required(100))
      .max(24)
      .refine(
        (ids) => new Set(ids).size === ids.length && !ids.includes("club"),
        "Rakipler benzersiz olmalı.",
      ),
    duration: z.number().int().min(1).max(150),
    starterCount: z.number().int().min(1).max(11),
    allowReentry: z.boolean(),
    winPoints: z.number().int().min(0).max(10),
    drawPoints: z.number().int().min(0).max(10),
    lossPoints: z.number().int().min(0).max(10),
    standingsEnabled: z.boolean().default(true),
    standingsRule: z.enum(["general", "tff"]).default("general"),
    headToHeadMeetings: z.number().int().min(1).max(4).default(2),
    published: z.boolean().default(false),
    order,
  }).refine((competition) => !competition.published || competition.opponentIds.length > 0, {
    path: ["opponentIds"],
    message: "Yayımlamak için en az bir rakip seçin. Rakipleri daha sonra eklemek için taslak olarak kaydedebilirsiniz.",
  }),
  news: z.object({
    title: required(),
    category: required(100),
    subtitle: text(500),
    body: required(50000),
    image: safeUrl.nullable(),
    published: z.boolean().default(true),
    order,
  }),
  teams: z
    .object({
      slug: z.string().transform(slugify).pipe(slug),
      name: required(100),
      season,
      photo: safeUrl.default(""),
      photoAlt: text(300).default(""),
      players: z.array(playerSchema).max(150),
      order,
    })
    .refine(
      (v) => new Set(v.players.map((p) => p.id)).size === v.players.length,
      "Oyuncu kimlikleri benzersiz olmalı.",
    ),
  staff: z.object({
    name: required(120),
    role: required(250),
    license: text(120).optional(),
    bio: text(12000).default(""),
    photo: safeUrl.default(""),
    order,
  }),
  matches: z
    .object({
      competitionId: required(100).nullable().optional(),
      homeId: required(100).nullable().optional(),
      awayId: required(100).nullable().optional(),
      kind: z.enum(["official", "friendly", "tournament"]).default("official"),
      published: z.boolean().default(true),
      report: matchReportSchema.nullable().optional(),
      teamSlug: slug,
      league: required(100),
      season,
      week: z.number().int().min(1).max(100),
      date: z.union([date, z.literal("")]),
      time: text(5)
        .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
        .nullable(),
      homeTeam: required(150),
      awayTeam: required(150),
      homeScore: z.number().int().min(0).max(99).nullable(),
      awayScore: z.number().int().min(0).max(99).nullable(),
      status: z.enum(["played", "awarded", "unreported", "withdrawn"]),
      venue: text(250).nullable(),
      note: text(2000).nullable(),
      order,
    })
    .superRefine((v, ctx) => {
      if (
        v.homeTeam.toLocaleLowerCase("tr") ===
        v.awayTeam.toLocaleLowerCase("tr")
      )
        ctx.addIssue({
          code: "custom",
          path: ["awayTeam"],
          message: "Ev sahibi ve deplasman farklı olmalı.",
        });
      if (v.competitionId && (!v.homeId || !v.awayId || v.homeId === v.awayId))
        ctx.addIssue({
          code: "custom",
          path: ["homeId"],
          message: "Organizasyondan iki farklı takım seçin.",
        });
      const hasBoth = v.homeScore !== null && v.awayScore !== null;
      if (!v.date && (v.status === "played" || v.status === "awarded"))
        ctx.addIssue({
          code: "custom",
          path: ["date"],
          message: "Sonucu girilen maçın tarihini belirtin.",
        });
      if (
        v.status === "played" || v.status === "awarded"
          ? !hasBoth
          : v.homeScore !== null || v.awayScore !== null
      )
        ctx.addIssue({
          code: "custom",
          path: ["homeScore"],
          message:
            "Oynanan/hükmen maçlarda iki skor da gerekli; diğer durumlarda skorları boş bırakın.",
        });
    }),
  settings: settingsSchema,
};
export type Section = keyof typeof schemas;
export const sectionNames: Record<Section, string> = {
  opponents: "Rakipler",
  competitions: "Organizasyonlar",
  news: "Haberler",
  teams: "Takımlar ve oyuncular",
  matches: "Maçlar",
  staff: "Teknik ekip",
  settings: "Sayfa ayarları",
};
