import { z } from "zod";

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
export const playerSchema = z.object({
  id: required(100),
  name: required(120),
  position: required(100),
  photo: safeUrl,
  placeholder: z.boolean().default(false),
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
      eyebrow: text(), title: required(), titleAccent: text(), description: text(1500),
      primaryLabel: required(), primaryHref: safeUrl, secondaryLabel: required(), secondaryHref: safeUrl,
      aboutTitle: required(), aboutSubtitle: text(), teamsTitle: required(), newsTitle: required(), staffTitle: required(),
      joinTitle: required(), joinSubtitle: text(), joinDescription: text(1500),
      resultsSeason: season,
    }),
    pages: z.object({ club: intro, teams: intro, news: intro, matches: intro, contact: intro }),
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
      slug,
      name: required(100),
      season,
      photo: safeUrl.refine(Boolean, "Takım görseli seçin."),
      photoAlt: text(300),
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
    bio: text(3000).default(""),
    photo: safeUrl.default(""),
    order,
  }),
  matches: z
    .object({
      teamSlug: slug,
      league: required(100),
      season,
      week: z.number().int().min(1).max(100),
      date,
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
      const hasBoth = v.homeScore !== null && v.awayScore !== null;
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
  news: "Haberler",
  teams: "Takımlar ve oyuncular",
  matches: "Maçlar",
  staff: "Teknik ekip",
  settings: "Sayfa ayarları",
};
