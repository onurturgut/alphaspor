import { HeroVideo } from "@/components/hero-video";
import "@/components/hero-video.css";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { getMatchData, getContent } from "@/lib/content";
import { Reveal } from "@/components/motion";
import { NewsShowcase } from "@/components/news-showcase";
import { CoachingTeam } from "@/components/coaching-team";
import { TrainingPrograms } from "@/components/training-programs";
import { formatMatchDate, selectMatches } from "@/lib/matches";

export default async function Home() {
  const [content, { matches }] = await Promise.all([
    getContent(),
    getMatchData(),
  ]);
  const archiveSeason = content.home.resultsSeason;
  const latestMatches = content.teams
    .filter((t) => matches.some((m) => m.teamSlug === t.slug))
    .slice(0, 4)
    .map(({ slug: team }) => ({
      team,
      match: selectMatches(matches, team, archiveSeason, true)[0],
    }));
  return (
    <>
      <section className="hero hero-video-section" aria-label="Alfa Spor">
        <div className="hero-stage">
          {content.heroVideo && <HeroVideo {...content.heroVideo} />}
          <div className="hero-copy">
            <p className="eyebrow">{content.home.eyebrow}</p>
            <h1>
              {content.home.title}
              <br />
              <span>{content.home.titleAccent}</span>
            </h1>
            <p className="hero-description" style={{ whiteSpace: "pre-line" }}>
              {content.home.description}
            </p>
            <div className="hero-actions">
              <Link
                href={content.home.primaryHref || "/takimlar"}
                className="button"
              >
                {content.home.primaryLabel}
                <ArrowUpRight size={19} />
              </Link>
              <Link
                href={content.home.secondaryHref || "/kulubumuz"}
                className="text-link"
              >
                {content.home.secondaryLabel}
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
          <a href="#sonuclar" className="hero-scroll">
            <ArrowDown size={16} />
            <span>KEŞFETMEYE DEVAM ET</span>
          </a>
        </div>
      </section>
      <section
        id="sonuclar"
        className="latest-results container"
        aria-labelledby="latest-results-title"
      >
        <div className="latest-results-heading">
          <div>
            <p className="micro">
              {archiveSeason} SEZONU · SON YAYIMLANAN SONUÇLAR
            </p>
            <h2 id="latest-results-title">
              <CalendarDays size={22} /> Sahadan sonuçlar.
            </h2>
          </div>
          <Link className="text-link" href="/maclar?gorunum=sonuclar">
            Tüm maçlar <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="latest-results-grid">
          {latestMatches.map(({ team, match }) => (
            <Link
              key={team}
              className="latest-result-card"
              href={`/maclar?takim=${team}&sezon=${encodeURIComponent(archiveSeason)}&gorunum=sonuclar`}
            >
              <div className="latest-result-meta">
                <h3>
                  {match?.league ??
                    (team === "u14-u15" ? "U14" : team.toUpperCase())}
                </h3>
                {match && (
                  <time dateTime={match.date}>
                    {formatMatchDate(match.date)}
                  </time>
                )}
              </div>
              {match ? (
                <>
                  <div className="latest-result-team">
                    <span>{match.homeTeam}</span>
                    <strong>{match.homeScore}</strong>
                  </div>
                  <div className="latest-result-team">
                    <span>{match.awayTeam}</span>
                    <strong>{match.awayScore}</strong>
                  </div>
                  <div className="latest-result-footer">
                    <span>
                      {match.status === "awarded"
                        ? "Hükmen sonuç"
                        : "Maç sonucu"}
                    </span>
                    <span>
                      Tüm sonuçlar <ArrowUpRight size={14} />
                    </span>
                  </div>
                </>
              ) : (
                <p className="latest-result-empty">Henüz sonuç yayımlanmadı.</p>
              )}
            </Link>
          ))}
        </div>
      </section>
      <TrainingPrograms />
      <CoachingTeam
        staff={content.staff}
        instagram={content.contact.instagram}
      />
      <section id="takimlar" className="section section-soft">
        <div className="academy-shell">
          <Reveal>
            <div className="academy-showcase">
              <div className="academy-intro">
                <p className="eyebrow">
                  <span>01</span> ALFA SPOR AKADEMİ
                </p>
                <h2>
                  Kendi hikâyen. <span>Kendi takımın.</span>
                </h2>
                <p className="academy-description">
                  Her oyuncumuz bu armanın özel bir parçası. Sahadaki
                  hikâyelerini kendilerine özel kartlarla görünür kılıyor, aynı
                  heyecanı takım olarak paylaşıyoruz.
                </p>
                <p className="academy-invitation">
                  Bir kartın arkasında bir oyuncu, her oyuncunun yanında bir
                  takım var. Peki, senin hikâyen hangi takımda başlayacak?
                </p>
                <a className="text-link" href="#academy-teams-title">
                  Takımları yakından tanı{" "}
                  <ArrowDown size={18} aria-hidden="true" />
                </a>
              </div>
              <div className="academy-portraits">
                <figure>
                  <Image
                    src="/media/club/b1b222c1-bc0c-44a3-b02d-1db0d4c60b48.png"
                    alt="Alfa Spor formasıyla futbol topu tutan genç oyuncu"
                    width={1024}
                    height={1536}
                    sizes="(max-width: 640px) 50vw, 240px"
                    style={{
                      display: "block",
                      width: "100%",
                      maxWidth: 240,
                      height: "auto",
                      borderRadius: 16,
                    }}
                  />
                  <figcaption>Sahadaki emek.</figcaption>
                </figure>
                <figure>
                  <Image
                    src="/media/club/ChatGPT Image 21 Eyl 2026 02_41_49.png"
                    alt="Onur için hazırlanmış Alfa SK oyuncu kartı"
                    width={1024}
                    height={1536}
                    sizes="(max-width: 640px) 50vw, 240px"
                    style={{
                      display: "block",
                      width: "100%",
                      maxWidth: 240,
                      height: "auto",
                      borderRadius: 16,
                    }}
                  />
                  <figcaption>Sana özel kimlik.</figcaption>
                </figure>
              </div>
            </div>
            <nav
              className="academy-teams"
              aria-labelledby="academy-teams-title"
            >
              <h3 id="academy-teams-title">
                Aynı arma. Farklı hikâyeler. Senin takımın hangisi?
              </h3>
              <p>
                U9’dan U15’e uzanan takımlarımızı keşfet. Yaş grubunu seç,
                sahayı kimlerle paylaşacağını gör.
              </p>
              <div className="academy-team-links">
                {content.teams.map((team) => (
                  <Link key={team.slug} href={`/takimlar/${team.slug}`}>
                    <span>
                      {team.name}
                      <small>Takımın hikâyesini keşfet</small>
                    </span>
                    <ArrowUpRight size={20} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </nav>
          </Reveal>
        </div>
      </section>
      <NewsShowcase
        title={content.home.newsTitle}
        news={content.news
          .filter(
            (n, i, items) =>
              items.findIndex((item) => item.category === n.category) === i,
          )
          .slice(0, 3)}
      />
      <section className="join-section container">
        <Reveal>
          <div className="join-top">
            <p className="eyebrow">
              <span>04</span>SENİN HİKÂYEN DE BURADA BAŞLASIN
            </p>
            <span className="micro">FETHİYE / MUĞLA</span>
          </div>
          <div className="join-main">
            <h2>
              {content.home.joinTitle}
              <br />
              <span className="muted">{content.home.joinSubtitle}</span>
            </h2>
            <div>
              <p>{content.home.joinDescription}</p>
              <Link href="/iletisim#basvuru" className="button">
                Birlikte başlayalım
                <ArrowUpRight size={20} />
              </Link>
            </div>
          </div>
          <div className="join-bottom">
            <span>
              <MapPin size={16} />
              {content.contact.address}
            </span>
            <a href={`tel:${content.contact.phone.replace(/[^+\d]/g, "")}`}>
              {content.contact.phone} <ArrowRight size={16} />
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
