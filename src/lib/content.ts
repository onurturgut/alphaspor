import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { getDb } from "./mongodb";
import type seed from "@/data/content.json";
import type sourceSeed from "@/data/match-sources.json";
import type { Match } from "./matches";
import type { HeroVideoAssets } from "@/components/hero-video";
import {
  defaultHome,
  defaultPages,
  defaultGallery,
  defaultValues,
} from "./site-settings";

type Content = Omit<typeof seed, "staff"> & {
  staff: ((typeof seed.staff)[number] & { photo?: string; bio?: string })[];
  heroVideo?: HeroVideoAssets;
  home: typeof defaultHome;
  pages: typeof defaultPages;
  gallery: typeof defaultGallery;
  values: typeof defaultValues;
};
export type MatchSource = (typeof sourceSeed)[number];
type Stored<T> = T & { _id: string; order?: number };

async function readList<T extends object>(name: string): Promise<T[]> {
  const db = await getDb();
  const rows = await db
    .collection(name)
    .find(
      {
        _deleted: { $ne: true },
        ...(name === "news" ? { published: { $ne: false } } : {}),
      },
      { projection: { _rev: 0, _deleted: 0, createdAt: 0, updatedAt: 0 } },
    )
    .sort({ order: 1, _id: 1 })
    .toArray();
  return rows.map((row) => {
    const { _id, order, ...value } = row;
    void _id;
    void order;
    return value as T;
  });
}

// Request-scoped deduplication; fresh database reads on each page request.
export const getContent = cache(async (): Promise<Content> => {
  await connection();
  const db = await getDb();
  const [teams, news, staff, settings] = await Promise.all([
    readList<Content["teams"][number]>("teams"),
    readList<Content["news"][number]>("news"),
    readList<Content["staff"][number]>("staff"),
    db
      .collection<
        Stored<
          Pick<
            Content,
            | "about"
            | "contact"
            | "heroVideo"
            | "home"
            | "pages"
            | "gallery"
            | "values"
          >
        >
      >("settings")
      .findOne({ _id: "club" }),
  ]);
  if (!settings)
    throw new Error(
      "Kulüp içeriği bulunamadı. npm run migrate:mongodb çalıştırın.",
    );
  return {
    teams,
    news,
    staff,
    about: settings.about,
    contact: settings.contact,
    heroVideo: settings.heroVideo,
    home: { ...defaultHome, ...settings.home },
    pages: { ...defaultPages, ...settings.pages },
    gallery: settings.gallery ?? defaultGallery,
    values: settings.values ?? defaultValues,
  };
});

export const getMatchData = cache(async () => {
  await connection();
  const [matches, matchSources] = await Promise.all([
    readList<Match>("matches"),
    readList<MatchSource>("matchSources"),
  ]);
  return { matches, matchSources };
});
