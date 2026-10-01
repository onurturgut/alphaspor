import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Fethiye Alfa Spor",
    short_name: "Alfa Spor",
    description: "Fethiye Alfa Spor: takımlar, kulüp haberleri ve maç sonuçları.",
    lang: "tr",
    dir: "ltr",
    orientation: "any",
    prefer_related_applications: false,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f4f4f4",
    theme_color: "#171717",
    categories: ["sports", "news"],
    screenshots: [
      { src: "/screenshots/mobile.webp", sizes: "412x915", type: "image/webp", form_factor: "narrow", label: "Alfa Spor ana sayfa — mobil" },
      { src: "/screenshots/desktop.webp", sizes: "1440x900", type: "image/webp", form_factor: "wide", label: "Alfa Spor ana sayfa — masaüstü" },
    ],
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
