import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";
const aldrich = localFont({
  src: "../../public/fonts/aldrich.woff2",
  variable: "--font-aldrich",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL("https://www.fethiyealfaspor.com"),
  title: {
    default: "Fethiye Alfa Spor | Bir Takım. Bir Rüya.",
    template: "%s | Fethiye Alfa Spor",
  },
  description:
    "Fethiye Alfa Spor: oyun temelli eğitim, bireysel gelişim ve takım ruhu. Takımlarımızı keşfedin, geleceğe birlikte adım atalım.",
  icons: { icon: "/media/logo.webp" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={aldrich.variable}>
      <body>
        <a className="skip-link" href="#main">
          İçeriğe geç
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
