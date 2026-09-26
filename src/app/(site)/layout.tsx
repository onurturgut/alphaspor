import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OpeningScreen } from "@/components/opening-screen";
import { QuickSupport } from "@/components/quick-support";
import { getContent } from "@/lib/content";
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { contact } = await getContent();
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
      <QuickSupport instagram={contact.instagram} />
      </div>
    </>
  );
}
