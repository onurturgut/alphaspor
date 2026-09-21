import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Fethiye Alfa Spor",
    short_name: "Alfa Spor",
    description: "Fethiye Alfa Spor: takımlar, kulüp haberleri ve maç sonuçları.",
    lang: "tr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f4f4f4",
    theme_color: "#171717",
    categories: ["sports", "news"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Maçlar ve Sonuçlar", short_name: "Maçlar", url: "/maclar" },
      { name: "Takımlarımız", short_name: "Takımlar", url: "/takimlar" },
      { name: "Kulüp Haberleri", short_name: "Haberler", url: "/haberler" },
    ],
  };
}
