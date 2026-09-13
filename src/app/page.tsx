import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
  CalendarDays,
  MapPin,
  Target,
  Users,
  MoveUpRight,
} from "lucide-react";
import content from "@/data/content.json";
import { Tilt, Reveal } from "@/components/motion";
import { Visual, SectionHeading, TeamCards, NewsCards } from "@/components/ui";
import { ContactSection } from "@/components/contact-section";
import { ClubGallery } from "@/components/club-gallery";
import { archiveSeason, formatMatchDate, selectMatches } from "@/lib/matches";

export default function Home() {
  const latestMatches = ["u11", "u12", "u13", "u14-u15"].map((team) => ({
    team,
    match: selectMatches(team, archiveSeason, true)[0],
  }));
  return (
    <>
      <section className="hero container">
        <div className="hero-topline">
          <span>
            <i className="status-dot" />
            FETHİYE ALFA SPOR KULÜBÜ
          </span>
          <span>2026 / 2027 SEZONU</span>
        </div>
        <div className="hero-stage hero-poster-stage">
          <div className="hero-image">
            <Image
              src="/media/hero-alfa.png"
              alt="Alfa Spor Kulübü: Burası Alfa. Stadyumda geleceğe bakan genç futbolcu ve gökyüzünde kurt gözleri."
              width={1024}
              height={1536}
              sizes="100vw"
              preload
              className="hero-poster"
            />
          </div>
          <div className="hero-copy">
            <p className="eyebrow">ALFA SPOR KULÜBÜ</p>
            <h1>
              BURASI
              <br />
              <span>ALFA</span>
            </h1>
            <p className="hero-description">
              Daha ilerisi her zaman mümkün.
              <br />
              Küçük adımlar, büyük hikâyeler.
            </p>
            <div className="hero-actions">
              <Link href="/takimlar" className="button">
                Takımlarımızı Keşfet
                <ArrowUpRight size={19} />
              </Link>
              <Link href="/kulubumuz" className="text-link">
                Hikâyemiz
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
          <div className="hero-side">GELİŞİM · KARAKTER · TAKIM RUHU</div>
          <a href="#kulup" className="hero-scroll">
            <ArrowDown size={16} />
            <span>KEŞFETMEYE DEVAM ET</span>
          </a>
          <span className="hero-caption">01 — YENİ BİR BAŞLANGIÇ</span>
        </div>
      </section>
      <section
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
      <section id="kulup" className="section container">
        <Reveal>
          <div className="about-grid">
            <div>
              <p className="eyebrow">
                <span>01</span>KULÜBÜMÜZ
              </p>
              <h2>
                Yalnızca futbol değil.
                <br />
                <span className="muted">Birlikte büyümek.</span>
              </h2>
            </div>
            <div className="about-copy">
              {content.about.split(/\n\s*\n/).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
              <Link href="/kulubumuz" className="text-link">
                Kulübümüzü tanıyın
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
          <ClubGallery />
          <div className="values-row">
            {[
              {
                Icon: Target,
                title: "Oyun temelli eğitim",
                text: "Keşfederek, deneyerek, oynayarak.",
              },
              {
                Icon: MoveUpRight,
                title: "Bireysel gelişim",
                text: "Her oyuncunun kendi yolculuğu.",
              },
              {
                Icon: Users,
                title: "Takım ruhu",
                text: "Birlikte öğrenir, birlikte büyürüz.",
              },
            ].map(({ Icon, title, text }, i) => (
              <div className="value" key={title}>
                <Icon size={23} strokeWidth={1.3} />
                <div>
                  <span className="micro">0{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
      <section id="takimlar" className="section section-soft">
        <div className="container">
          <Reveal>
            <SectionHeading
              number="02"
              eyebrow="AYNI ARMA, AYNI HEYECAN"
              title="Geleceğin Alfaları."
              href="/takimlar"
              linkText="Tüm takımlar"
            />
            <TeamCards teams={content.teams} />
          </Reveal>
        </div>
      </section>
      <section className="section container">
        <Reveal>
          <SectionHeading
            number="03"
            eyebrow="KULÜPTEN, SAHADAN, BİZDEN"
            title="Duyurular."
            href="/haberler"
            linkText="Tüm duyurular"
          />
          <NewsCards
            news={content.news
              .filter(
                (n, i, items) =>
                  items.findIndex((item) => item.category === n.category) === i,
              )
              .slice(0, 3)}
          />
        </Reveal>
      </section>
      <section id="teknik-ekip" className="section section-soft">
        <div className="container">
          <Reveal>
            <SectionHeading
              number="04"
              eyebrow="GELİŞİME REHBERLİK EDENLER"
              title="Sahanın arkasındaki ekip."
              href="/kulubumuz#teknik-ekip"
              linkText="Ekibimizi tanıyın"
            />
            <div className="staff-grid">
              {content.staff.map((person, i) => (
                <div className="staff-card" key={person.name}>
                  <Tilt>
                    <Visual className={`staff-visual staff-${i}`} />
                  </Tilt>
                  <h3>{person.name}</h3>
                  <p>{person.role}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
      <section className="join-section container">
        <Reveal>
          <div className="join-top">
            <p className="eyebrow">
              <span>05</span>SENİN HİKÂYEN DE BURADA BAŞLASIN
            </p>
            <span className="micro">FETHİYE / MUĞLA</span>
          </div>
          <div className="join-main">
            <h2>
              Gelecek sensin.
              <br />
              <span className="muted">Alfa’ya katıl.</span>
            </h2>
            <div>
              <p>
                Sahaya ilk adımını atmak ve kulübümüzü tanımak için bizimle
                iletişime geç.
              </p>
              <Link href="/iletisim#basvuru" className="button">
                Birlikte başlayalım
                <ArrowUpRight size={20} />
              </Link>
            </div>
          </div>
          <div className="join-bottom">
            <span>
              <MapPin size={16} />
              Fethiye, Muğla
            </span>
            <a href="tel:+905387662431">
              +90 538 766 24 31 <ArrowRight size={16} />
            </a>
          </div>
        </Reveal>
      </section>
      <section className="section section-soft">
        <div className="container">
          <SectionHeading
            number="06"
            eyebrow="TANIŞALIM"
            title="Sahaya uzanan ilk adım."
          />
          <ContactSection />
        </div>
      </section>
    </>
  );
}
