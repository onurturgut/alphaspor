import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OpeningScreen } from "@/components/opening-screen";
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <OpeningScreen />
      <div id="site-content">
      <a className="skip-link" href="#main">
        İçeriğe geç
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      </div>
    </>
  );
}
