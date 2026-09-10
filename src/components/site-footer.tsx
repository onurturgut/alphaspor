import Link from "next/link";
import { ArrowUpRight, Camera as Instagram } from "lucide-react";
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div>
          <Link className="footer-brand" href="/">
            ALFA SPOR<span>FETHİYE</span>
          </Link>
          <p>
            Aidiyetle kurulur.
            <br />
            Güvenle büyür.
          </p>
        </div>
        <div>
          <span className="micro">KULÜBÜ KEŞFET</span>
          <Link href="/kulubumuz">Kulübümüz</Link>
          <Link href="/takimlar">Takımlarımız</Link>
          <Link href="/haberler">Haberler</Link>
        </div>
        <div>
          <span className="micro">SAHADA VE ÖTESİNDE</span>
          <Link href="/maclar">Maçlar ve Sonuçlar</Link>
          <Link href="/iletisim">İletişim</Link>
          <a
            href="https://www.instagram.com/alfaskfethiye"
            target="_blank"
            rel="noreferrer"
          >
            <Instagram size={15} /> Instagram <ArrowUpRight size={14} />
          </a>
        </div>
        <div>
          <span className="micro">BİZE ULAŞIN</span>
          <a href="tel:+905387662431">+90 538 766 24 31</a>
          <a href="mailto:Fethiyealfask@gmail.com">Fethiyealfask@gmail.com</a>
          <span className="muted">Fethiye, Muğla</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} Fethiye Alfa Spor. Tüm hakları saklıdır.
        </span>
        <span>BİR TAKIM. BİR RÜYA.</span>
      </div>
    </footer>
  );
}
