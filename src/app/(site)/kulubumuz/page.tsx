import type { Metadata } from "next";
import Image from "next/image";
import { getContent } from "@/lib/content";
import { PageIntro } from "@/components/page-intro";
import { Visual, SectionHeading } from "@/components/ui";
import { Tilt } from "@/components/motion";
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
        <div id="teknik-ekip">
          <SectionHeading
            number="01"
            eyebrow="GELİŞİME REHBERLİK EDENLER"
            title="Teknik ekibimiz."
          />
          <div className="staff-grid">
            {content.staff.map((person) => (
              <div className="staff-card" key={person.name}>
                <Tilt>
                  {person.photo ? (
                    <Image
                      src={person.photo}
                      alt={person.name}
                      width={600}
                      height={700}
                      style={{ width: "100%", height: 300, objectFit: "cover" }}
                    />
                  ) : (
                    <Visual className="staff-visual" />
                  )}
                </Tilt>
                <h3>{person.name}</h3>
                <p>{person.role}</p>
                {"bio" in person &&
                  typeof person.bio === "string" &&
                  person.bio && <p>{person.bio}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
