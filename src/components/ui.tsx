import Link from "next/link";
import Image from "next/image";
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
  teams: {
    slug: string;
    name: string;
    playerCount: number;
    photo: string;
    photoAlt: string;
  }[];
}) {
  return (
    <div className="team-grid">
      {teams.map((team, i) => (
        <Tilt key={team.slug}>
          <Link className="team-card" href={`/takimlar/${team.slug}`}>
            <div className="team-card-media">
              <Image
                src={team.photo}
                alt={team.photoAlt}
                fill
                sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                className="team-photo"
              />
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
  fullText = false,
}: {
  news: {
    id: string;
    title: string;
    category: string;
    subtitle: string;
    image: string | null;
    body: string;
  }[];
  fullText?: boolean;
}) {
  return (
    <div className="news-grid">
      {news.map((item) => (
        <Link className="news-card" href={`/haberler/${item.id}`} key={item.id}>
          <div className="news-visual">
            {item.image && (
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw"
                style={{ objectFit: "contain" }}
              />
            )}
          </div>
          <div className="news-meta">
            <span>{item.category}</span>
            <ArrowUpRight size={18} />
          </div>
          <h3>{item.title}</h3>
          <p>{item.subtitle}</p>
          {fullText && <p className="news-body">{item.body}</p>}
          <span className="micro news-read">
            HABERİ OKU <ArrowRight size={14} />
          </span>
        </Link>
      ))}
    </div>
  );
}
