import type { NextConfig } from "next";
import media from "./src/data/r2-media.json";
const mediaOrigins = [
  ...new Set(Object.values(media).map((url) => new URL(url).origin)),
];
const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/sw.js",
      headers: [
        { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        { key: "Service-Worker-Allowed", value: "/" },
        { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'; object-src 'none'" },
      ],
    }];
  },
  images: {
    // Serve R2 assets directly: Next's remote optimizer aborts upstream
    // downloads after 7 seconds, which larger gallery images can exceed.
    unoptimized: true,
    remotePatterns: mediaOrigins.map((origin) => new URL(`${origin}/media/**`)),
  },
  async redirects() {
    return [
      { source: "/ekiplerimiz", destination: "/takimlar", permanent: true },
      { source: "/duyurular", destination: "/haberler", permanent: true },
      { source: "/hakkında", destination: "/kulubumuz", permanent: true },
      { source: "/tanıtım", destination: "/kulubumuz", permanent: true },
      {
        source: "/teknik-ekip",
        destination: "/kulubumuz#teknik-ekip",
        permanent: true,
      },
      { source: "/İletişim", destination: "/iletisim", permanent: true },
      ...["u10", "u11", "u13", "u14-u15"].map((team) => ({
        source: `/${team}`,
        destination: `/takimlar/${team}`,
        permanent: true,
      })),
      { source: "/u12-1", destination: "/takimlar/u12", permanent: true },
      ...["u11", "u12", "u13", "u14"].map((team) => ({
        source: `/${team}-lİgİ`,
        destination: `/maclar?takim=${team}`,
        permanent: true,
      })),
    ].map((rule) => ({ ...rule, source: encodeURI(rule.source) }));
  },
};
export default nextConfig;
