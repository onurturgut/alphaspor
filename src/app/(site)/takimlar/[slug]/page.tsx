import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getContent } from "@/lib/content";
import { PageIntro } from "@/components/page-intro";
import { RosterExplorer } from "@/components/roster-explorer";
import { NewsCards, SectionHeading } from "@/components/ui";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const content = await getContent();
  const { slug } = await params;
  const team = content.teams.find((t) => t.slug === slug);
  return { title: team ? `${team.name} Takımı` : "Takım bulunamadı" };
}
export default async function Team({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const content = await getContent();
  const { slug } = await params;
  const team = content.teams.find((t) => t.slug === slug);
  if (!team) notFound();
  const news = content.news
    .filter((n) => n.category === (team.name === "U14/U15" ? "U14" : team.name))
    .slice(0, 3);
  return (
    <>
      <PageIntro
        title={`${team.name} Takımı`}
        eyebrow="FETHİYE ALFA SPOR AKADEMİ"
        description="Sahada birlikte öğreniyor, her antrenmanda bir adım ileri gidiyoruz."
        parent={{ href: "/takimlar", label: "Takımlar" }}
      />
      <div className="container page-content">
        <nav className="team-switcher" aria-label="Yaş grubu seçimi">
          {content.teams.map((t) => (
            <Link
              href={`/takimlar/${t.slug}`}
              key={t.slug}
              aria-current={t.slug === slug ? "page" : undefined}
            >
              {t.name}
            </Link>
          ))}
        </nav>
        <div className="team-summary">
          <h2>Kadromuz</h2>
          <p>
            {team.playerCount > 0
              ? `${team.playerCount} sporcu · Bir takım`
              : "Yeni sezon kadrosu hazırlanıyor"}
          </p>
        </div>
        {team.players.length ? (
          <RosterExplorer
            key={team.slug}
            players={team.players}
            teamName={team.name}
          />
        ) : (
          <div className="empty-state">
            <h2>Gelecek burada büyür.</h2>
            <p>
              {team.name} takımımızın kadrosu yakında burada. Eğitim ve katılım
              hakkında bilgi almak için bize ulaşın.
            </p>
            <Link className="button" href="/iletisim">
              Bize ulaşın
              <ArrowUpRight size={18} />
            </Link>
          </div>
        )}
        <div className="team-details">
          <div>
            <h2>Sıradaki heyecan.</h2>
            <p>
              {team.name} takımının maç programını ve sonuçlarını maç
              merkezinden takip edebilirsiniz.
            </p>
          </div>
          <Link
            className="button button-outline"
            href={`/maclar?takim=${team.slug}`}
          >
            Maçlar ve sonuçlar
            <ArrowUpRight size={17} />
          </Link>
        </div>
        {news.length > 0 && (
          <section className="section">
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
      </div>
    </>
  );
}
