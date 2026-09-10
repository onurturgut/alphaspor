import type { MetadataRoute } from "next";
import content from "@/data/content.json";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.fethiyealfaspor.com";
  return [
    "",
    "/kulubumuz",
    "/takimlar",
    "/haberler",
    "/maclar",
    "/iletisim",
    ...content.teams.map((t) => `/takimlar/${t.slug}`),
    ...content.news.map((n) => `/haberler/${n.id}`),
  ].map((p) => ({
    url: base + p,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));
}
