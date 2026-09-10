import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Tilt } from "./motion";
export function Visual({ className = "" }: { className?: string }) {
  return (
    <div className={`visual-placeholder ${className}`} aria-hidden="true">
      <span>g</span>
    </div>
  );
}
export function SectionHeading({
  number,
  eyebrow,
  title,
  href,
  linkText,
}: {
  number: string;
  eyebrow: string;
  title: string;
  href?: string;
  linkText?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">
          <span>{number}</span>
          {eyebrow}
        </p>
        <h2>{title}</h2>
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {linkText || "Tümünü keşfet"}
          <ArrowUpRight size={18} />
        </Link>
      )}
    </div>
  );
}
export function TeamCards({
  teams,
}: {
  teams: { slug: string; name: string; playerCount: number }[];
}) {
  return (
    <div className="team-grid">
      {teams.map((team, i) => (
        <Tilt key={team.slug}>
          <Link className="team-card" href={`/takimlar/${team.slug}`}>
            <div className="team-card-media">
              <Visual />
              <span className="card-index">0{i + 1}</span>
              <span className="circle-arrow">
                <ArrowUpRight size={21} />
              </span>
            </div>
            <div className="team-card-info">
              <div>
                <span className="micro">ALFA SPOR AKADEMİ</span>
                <h3>{team.name}</h3>
              </div>
              <span className="team-link">
                Takımı incele <ArrowRight size={15} />
              </span>
            </div>
          </Link>
        </Tilt>
      ))}
    </div>
  );
}
export function NewsCards({
  news,
}: {
  news: { id: string; title: string; category: string; subtitle: string }[];
}) {
  return (
    <div className="news-grid">
      {news.map((item, i) => (
        <Link className="news-card" href={`/haberler/${item.id}`} key={item.id}>
          <Visual className={`news-visual news-visual-${i}`} />
          <div className="news-meta">
            <span>{item.category}</span>
            <ArrowUpRight size={18} />
          </div>
          <h3>{item.title}</h3>
          <p>{item.subtitle}</p>
          <span className="micro news-read">
            HABERİ OKU <ArrowRight size={14} />
          </span>
        </Link>
      ))}
    </div>
  );
}
