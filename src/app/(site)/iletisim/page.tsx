import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { ContactSection } from "@/components/contact-section";
import { getContent } from "@/lib/content";
export const metadata: Metadata = {
  title: "İletişim ve Başvuru",
  description:
    "Fethiye Alfa Spor ile iletişime geçin. Futbol eğitimi, takımlar ve başvuru için +90 538 766 24 31.",
};
export default async function Contact() {
  const content = await getContent();
  return (
    <>
      <PageIntro {...content.pages.contact} />
      <section className="container page-content">
        <ContactSection />
      </section>
    </>
  );
}
