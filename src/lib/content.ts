import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { getDb } from "./mongodb";
import { previewContext } from "./admin/preview-context";
import type seed from "@/data/content.json";
import defaultHeroVideo from "@/data/hero-video.json";
import type sourceSeed from "@/data/match-sources.json";
import {
  withMatchAppearances,
  type Match,
  type Competition,
  type Opponent,
} from "./matches";
import type { AcademyPlayer } from "./academy";
import type { HeroVideoAssets } from "@/components/hero-video";
import {
  defaultHome,
  defaultPages,
  defaultGallery,
  defaultValues,
} from "./site-settings";

type Content = Omit<typeof seed, "staff" | "teams"> & {
  teams: (Omit<(typeof seed.teams)[number], "players"> & {
    players: AcademyPlayer[];
  })[];
  staff: ((typeof seed.staff)[number] & {
    photo?: string;
    bio?: string;
    license?: string;
  })[];
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
    return (
      name === "competitions" || name === "opponents"
        ? { ...value, _id }
        : value
    ) as T;
  });
}

// Request-scoped deduplication; fresh database reads on each page request.
export const getContent = cache(async (): Promise<Content> => {
  await connection();
  const db = await getDb();
  const [teams, news, staff, storedSettings, matchData] = await Promise.all([
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
    getMatchData(),
  ]);
  const settings = previewContext.getStore() ?? storedSettings;
  if (!settings)
    throw new Error(
      "Kulüp içeriği bulunamadı. npm run migrate:mongodb çalıştırın.",
    );
  return {
    teams: withMatchAppearances(teams, matchData.matches),
    news,
    staff,
    about: settings.about,
    contact: settings.contact,
    heroVideo: settings.heroVideo ?? defaultHeroVideo,
    home: { ...defaultHome, ...settings.home },
    pages: { ...defaultPages, ...settings.pages },
    gallery: settings.gallery ?? defaultGallery,
    values: settings.values ?? defaultValues,
  };
});

export const getMatchData = cache(async () => {
  await connection();
  const [allMatches, matchSources, allCompetitions, opponents] =
    await Promise.all([
      readList<Match>("matches"),
      readList<MatchSource>("matchSources"),
      readList<Competition>("competitions"),
      readList<Opponent>("opponents"),
    ]);
  const competitions = allCompetitions.filter((c) => c.published);
  const matches = allMatches.filter(
    (m) =>
      m.published !== false &&
      (!m.competitionId || competitions.some((c) => c._id === m.competitionId)),
  );
  return { matches, matchSources, competitions, opponents };
});
