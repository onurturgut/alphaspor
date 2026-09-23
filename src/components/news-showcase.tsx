import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { getContent } from "@/lib/content";
import "./news-showcase.css";

type News = Awaited<ReturnType<typeof getContent>>["news"];

export function NewsShowcase({ title, news }: { title: string; news: News }) {
  if (!news.length) return null;

  return (
    <section
      id="duyurular"
      className="news-showcase section container"
      aria-labelledby="news-showcase-title"
    >
      <div className="news-showcase-heading">
        <div className="news-showcase-intro">
          <p className="news-showcase-eyebrow">KULÜPTEN HABERLER</p>
          <h2 id="news-showcase-title">{title}</h2>
        </div>
        <Link href="/haberler" className="news-showcase-all">
          Tüm duyurular <ArrowUpRight size={20} aria-hidden="true" />
        </Link>
      </div>
      <div className="news-showcase-grid">
        {news.slice(0, 3).map((item, index) => (
          <Link
            className={`news-showcase-card${index === 0 ? " news-showcase-featured" : ""}${!item.image ? " news-showcase-no-image" : ""}`}
            href={`/haberler/${item.id}`}
            key={item.id}
          >
            {item.image && (
              <div className="news-showcase-visual">
                <Image
                  className="news-showcase-image"
                  src={item.image}
                  alt=""
                  fill
                  sizes={
                    index === 0
                      ? "(max-width: 700px) 100vw, 55vw"
                      : "(max-width: 700px) 112px, 20vw"
                  }
                />
              </div>
            )}
            <div className="news-showcase-copy">
              <span className="news-showcase-category">{item.category}</span>
              <h3>{item.title}</h3>
              {item.subtitle && <p>{item.subtitle}</p>}
              <span className="news-showcase-read">
                Haberi oku <ArrowUpRight size={18} aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
