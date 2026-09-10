import type { Metadata } from "next";
import Link from "next/link";
import content from "@/data/content.json";
import { PageIntro } from "@/components/page-intro";
import { NewsCards } from "@/components/ui";
export const metadata: Metadata = {
  title: "Haberler",
  description:
    "Alfa Spor’dan haberler, oyuncu alımları, antrenmanlar ve maçlardan notlar.",
};
export default async function News({
  searchParams,
}: {
  searchParams: Promise<{ takim?: string }>;
}) {
  const { takim } = await searchParams;
  const categories = [...new Set(content.news.map((n) => n.category))];
  const category = categories.includes(takim || "") ? takim : undefined;
  const news = category
    ? content.news.filter((n) => n.category === category)
    : content.news;
  return (
    <>
      <PageIntro
        title="Alfa’dan haberler."
        eyebrow="KULÜPTEN, SAHADAN, BİZDEN"
        description="Gelişim yolculuğumuzdan hikâyeler, takım haberleri ve yeni başlangıçlar."
      />
      <section className="container page-content">
        <nav className="filter-bar" aria-label="Haber kategorileri">
          <Link href="/haberler" aria-current={!category ? "true" : undefined}>
            Tümü
          </Link>
          {categories.map((c) => (
            <Link
              href={`/haberler?takim=${encodeURIComponent(c)}`}
              aria-current={category === c ? "true" : undefined}
              key={c}
            >
              {c}
            </Link>
          ))}
        </nav>
        <NewsCards news={news} />
      </section>
    </>
  );
}
