import Link from "next/link";
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
import { archiveSeason, formatMatchDate, selectMatches } from "@/lib/matches";

export default function Home() {
  const latestMatch = selectMatches("", archiveSeason, true)[0];
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
        <div className="hero-stage">
          <Tilt className="hero-image">
            <Visual />
          </Tilt>
          <div className="hero-copy">
            <p className="eyebrow">GELECEĞİN OYUNU BURADA BAŞLAR</p>
            <h1>
              BİR TAKIM!
              <br />
              <span>BİR RÜYA!</span>
            </h1>
            <p className="hero-description">
              Aidiyetle kurulur. Güvenle büyür.
              <br />
              Sahada birlikte, geleceğe birlikte.
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
      <div className="match-strip container">
        <div className="match-strip-label">
          <CalendarDays size={21} />
          <span>
            SAHADAN
            <br />
            HABERLER
          </span>
        </div>
        <div>
          <span className="micro">
            SON YAYIMLANAN SONUÇ · {latestMatch.league} ·{" "}
            {formatMatchDate(latestMatch.date)}
          </span>
          <p>
            {latestMatch.homeTeam} {latestMatch.homeScore} –{" "}
            {latestMatch.awayScore} {latestMatch.awayTeam}
          </p>
        </div>
        <div className="match-strip-status">
          <span className="status-dot" />
          {archiveSeason.replace("/", " / ")} sezonu
        </div>
        <Link className="text-link" href="/maclar?gorunum=sonuclar">
          Maç merkezi
          <ArrowUpRight size={18} />
        </Link>
      </div>
      <section id="kulup" className="section container">
        <Reveal>
          <div className="about-grid">
            <div>
              <p className="eyebrow">
                <span>01</span>BİZ ALFA’YIZ
              </p>
              <h2>
                Yalnızca futbol değil.
                <br />
                <span className="muted">Birlikte büyümek.</span>
              </h2>
            </div>
            <div className="about-copy">
              <p>
                Her çocuğun içinde bir potansiyel var. Biz, oyun temelli eğitim
                ve bireysel gelişim yaklaşımımızla bu potansiyelin sahaya
                yansıması için buradayız.
              </p>
              <Link href="/kulubumuz" className="text-link">
                Kulübümüzü tanıyın
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
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
            title="Alfa’dan haberler."
            href="/haberler"
            linkText="Tüm haberler"
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
