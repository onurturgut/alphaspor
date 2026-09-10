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
  const { takim, sezon, gorunum } = await searchParams;
  const initialSeason = sezon === "2026/2027" ? sezon : archiveSeason;
  const initialTab = gorunum === "sonuclar" ? "results" : "fixtures";
  return (
    <>
      <PageIntro
        title="Maç merkezi."
        eyebrow="HER MAÇ YENİ BİR HİKÂYE"
        description="Takımını ve sezonunu seç. Tüm haftaları incele, sahadaki sonuçları takip et."
      />
      <div className="container page-content">
        <MatchCenter
          key={`${takim || "all"}:${initialSeason}:${initialTab}`}
          initialTeam={takim === "u14" ? "u14-u15" : takim}
          initialSeason={initialSeason}
          initialTab={initialTab}
        />
      </div>
    </>
  );
}
