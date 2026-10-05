import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/content";
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
  searchParams: Promise<{ takim?: string; sayfa?: string }>;
}) {
  const content = await getContent();
  const { takim, sayfa } = await searchParams;
  const categories = [...new Set(content.news.map((n) => n.category))];
  const category = categories.includes(takim || "") ? takim : undefined;
  const news = category
    ? content.news.filter((n) => n.category === category)
    : content.news;
  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(news.length / pageSize));
  const requestedPage = Number.parseInt(sayfa ?? "1", 10);
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const visibleNews = news.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const pageHref = (page: number) => ({
    pathname: "/haberler",
    query: {
      ...(category ? { takim: category } : {}),
      ...(page > 1 ? { sayfa: page } : {}),
    },
  });
  return (
    <>
      <PageIntro {...content.pages.news} />
      <section className="container page-content news-pattern">
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
        <NewsCards news={visibleNews} />
        {totalPages > 1 && (
          <nav className="news-pagination" aria-label="Haber sayfaları">
            {currentPage > 1 ? (
              <Link href={pageHref(currentPage - 1)}>← Önceki</Link>
            ) : (
              <span aria-disabled="true">← Önceki</span>
            )}
            <strong>
              {currentPage} / {totalPages}
            </strong>
            {currentPage < totalPages ? (
              <Link href={pageHref(currentPage + 1)}>Sonraki →</Link>
            ) : (
              <span aria-disabled="true">Sonraki →</span>
            )}
          </nav>
        )}
      </section>
    </>
  );
}
