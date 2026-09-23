import Image from "next/image";
import Link from "next/link";
import { Camera, Clock3, Mail, MapPin, Phone } from "lucide-react";
import { getContent } from "@/lib/content";
import { PwaControls } from "./pwa-controls";
import "./site-footer.css";

export async function SiteFooter() {
  const { contact, teams } = await getContent();
  return (
    <footer className="site-footer club-footer">
      <div className="container club-footer-grid">
        <div className="club-footer-about">
          <Link
            className="club-footer-brand"
            href="/"
            aria-label="Alfa Spor ana sayfa"
          >
            <Image src="/media/logo.webp" alt="" width={64} height={76} />
            <span>
              ALFA SPOR<small>FETHİYE · 2024</small>
            </span>
          </Link>
          <p>
            Bir takım. Bir rüya. Fethiye’de futbol sevgisini, takım ruhunu ve
            birlikte gelişmenin gücünü sahaya taşıyoruz.
          </p>
          {contact.instagram && (
            <a
              className="club-footer-social"
              href={contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Alfa Spor Instagram (yeni sekmede açılır)"
            >
              <Camera size={22} aria-hidden="true" />
            </a>
          )}
          <PwaControls />
        </div>
        <nav className="club-footer-column" aria-label="Alt menü">
          <h2>Sayfalar</h2>
          <Link href="/">Ana Sayfa</Link>
          <Link href="/kulubumuz">Kulübümüz</Link>
          <Link href="/haberler">Duyurular</Link>
          <Link href="/maclar">Maçlar ve Sonuçlar</Link>
          <Link href="/iletisim">İletişim</Link>
        </nav>
        <nav className="club-footer-column" aria-label="Alt menü takımlarımız">
          <h2>Takımlarımız</h2>
          {teams.map((team) => (
            <Link key={team.slug} href={`/takimlar/${team.slug}`}>
              {team.name}
            </Link>
          ))}
        </nav>
        <div className="club-footer-column club-footer-contact">
          <h2>İletişim</h2>
          <div>
            <MapPin size={18} aria-hidden="true" />
            <span>{contact.address}</span>
          </div>
          <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}>
            <Phone size={18} aria-hidden="true" />
            <span>{contact.phone}</span>
          </a>
          <a href={`mailto:${contact.email}`}>
            <Mail size={18} aria-hidden="true" />
            <span>{contact.email}</span>
          </a>
          {contact.hours && (
            <div>
              <Clock3 size={18} aria-hidden="true" />
              <span>{contact.hours}</span>
            </div>
          )}
        </div>
      </div>
      <div className="container club-footer-bottom">
        <p>
          © {new Date().getFullYear()} Fethiye Alfa Spor. Tüm hakları saklıdır.
        </p>
        <p>
          Bu site <a href="https://www.onurturgut.com/">Aisurix.web</a>{" "}
          tarafından tasarlanmıştır.
        </p>
      </div>
    </footer>
  );
}
