import { getMatchData, getContent } from "@/lib/content";
import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { MatchCenter } from "@/components/match-center";
import { archiveSeason } from "@/lib/matches";
export const metadata: Metadata = {
  title: "Maçlar ve Sonuçlar",
  description:
    "Fethiye Alfa Spor takımlarının sezonlara göre maç programları ve sonuçları.",
};
export default async function Matches({
  searchParams,
}: {
  searchParams: Promise<{ takim?: string; sezon?: string; gorunum?: string }>;
}) {
  const [{ matches, matchSources }, content] = await Promise.all([
    getMatchData(),
    getContent(),
  ]);
  const { takim, sezon, gorunum } = await searchParams;
  const initialSeason = sezon || content.home.resultsSeason || archiveSeason;
  const initialTab = gorunum === "sonuclar" ? "results" : "fixtures";
  return (
    <>
      <PageIntro {...content.pages.matches} />
      <div className="container page-content">
        <MatchCenter
          matches={matches}
          matchSources={matchSources}
          teamOptions={content.teams.map((t) => ({
            slug: t.slug,
            name: t.name,
            season: t.season,
          }))}
          key={`${takim || "all"}:${initialSeason}:${initialTab}`}
          initialTeam={takim === "u14" ? "u14-u15" : takim}
          initialSeason={initialSeason}
          initialTab={initialTab}
        />
      </div>
    </>
  );
}
