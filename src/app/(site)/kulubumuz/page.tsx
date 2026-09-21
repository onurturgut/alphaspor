import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { PageIntro } from "@/components/page-intro";
import { Visual } from "@/components/ui";
import { CoachingTeam } from "@/components/coaching-team";
export const metadata: Metadata = {
  title: "Kulübümüz",
  description:
    "2024’te Fethiye’de kurulan Alfa Spor’un eğitim yaklaşımı ve teknik ekibi.",
};
export default async function Club() {
  const content = await getContent();
  return (
    <>
      <PageIntro {...content.pages.club} />
      <section className="container page-content">
        <div className="club-block">
          <div className="prose">
            {content.about.split(/\n\s*\n/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <Visual />
        </div>
      </section>
      <CoachingTeam
        staff={content.staff}
        instagram={content.contact.instagram}
      />
    </>
  );
}
