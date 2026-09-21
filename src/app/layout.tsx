import { mediaUrl } from "@/lib/media";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./themes.css";
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
  icons: { icon: mediaUrl("/media/logo.webp") },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={aldrich.variable} suppressHydrationWarning>
      <head>
        <script
          id="alfa-theme-init"
          dangerouslySetInnerHTML={{
            __html: `(function(){var t;try{t=localStorage.getItem('alfa-theme')}catch(e){}document.documentElement.dataset.theme=t==='light'||t==='dark'?t:window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'})()`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
