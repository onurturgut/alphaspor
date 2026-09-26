import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import { AcademyExplorer } from "@/components/academy-explorer";
import { NewsCards, SectionHeading } from "@/components/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const team = content.teams.find((t) => t.slug === slug);
  return { title: team ? `${team.name} Takımı` : "Takım bulunamadı" };
}

export default async function Team({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getContent();
  const team = content.teams.find((t) => t.slug === slug);
  if (!team) notFound();
  const news = content.news
    .filter((n) => n.category === (team.name === "U14/U15" ? "U14" : team.name))
    .slice(0, 3);
  return (
    <>
      <AcademyExplorer
        key={team.slug}
        teams={content.teams}
        initialTeam={team.slug}
      />
      {news.length > 0 && (
        <section className="section container">
          <SectionHeading
            number="02"
            eyebrow={`${team.name} TAKIMINDAN`}
            title="Sahadan notlar."
            href={`/haberler?takim=${encodeURIComponent(news[0].category)}`}
            linkText="Tüm haberler"
          />
          <NewsCards news={news} />
        </section>
      )}
    </>
  );
}
