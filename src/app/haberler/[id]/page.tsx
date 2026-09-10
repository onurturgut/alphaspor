import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import content from "@/data/content.json";
import { PageIntro } from "@/components/page-intro";
import { Visual } from "@/components/ui";
export function generateStaticParams() {
  return content.news.map((n) => ({ id: n.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const news = content.news.find((n) => n.id === id);
  return {
    title: news?.title || "Haber bulunamadı",
    description: news?.body.slice(0, 160),
  };
}
export default async function Article({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = content.news.find((n) => n.id === id);
  if (!item) notFound();
  return (
    <>
      <PageIntro
        title={item.title}
        eyebrow={`${item.category} · KULÜP HABERLERİ`}
        parent={{ href: "/haberler", label: "Haberler" }}
      />
      <article className="container page-content">
        <div className="article-layout">
          <Visual />
          <div className="article-meta">
            <span>{item.category}</span>
            <span>{item.subtitle}</span>
          </div>
          <div className="prose">{item.body}</div>
          <div className="article-back">
            <Link className="text-link" href="/haberler">
              <ArrowLeft size={16} />
              Haberlerin tümüne dön
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
