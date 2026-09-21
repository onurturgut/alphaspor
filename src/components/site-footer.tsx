import Link from "next/link";
import { ArrowUpRight, Camera as Instagram } from "lucide-react";
import { getContent } from "@/lib/content";
import { PwaControls } from "./pwa-controls";
export async function SiteFooter() {
  const { contact } = await getContent();
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
          <PwaControls />
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
          <a href={contact.instagram || "#"} target="_blank" rel="noreferrer">
            <Instagram size={15} /> Instagram <ArrowUpRight size={14} />
          </a>
        </div>
        <div>
          <span className="micro">BİZE ULAŞIN</span>
          <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}>
            {contact.phone}
          </a>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <span className="muted">{contact.address}</span>
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
