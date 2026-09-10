import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  poweredByHeader: false,
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
