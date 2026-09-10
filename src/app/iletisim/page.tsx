import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { ContactSection } from "@/components/contact-section";
export const metadata: Metadata = {
  title: "İletişim ve Başvuru",
  description:
    "Fethiye Alfa Spor ile iletişime geçin. Futbol eğitimi, takımlar ve başvuru için +90 538 766 24 31.",
};
export default function Contact() {
  return (
    <>
      <PageIntro
        title="İlk adımı birlikte atalım."
        eyebrow="İLETİŞİM & BAŞVURU"
        description="Bir sorunuz, bir hayaliniz ya da sahaya çıkmak için heyecanınız varsa sizi dinlemek isteriz."
      />
      <section className="container page-content">
        <ContactSection />
      </section>
    </>
  );
}
