import type { Metadata } from "next";
import content from "@/data/content.json";
import { PageIntro } from "@/components/page-intro";
import { Visual, SectionHeading } from "@/components/ui";
import { Tilt } from "@/components/motion";
export const metadata: Metadata = {
  title: "Kulübümüz",
  description:
    "2024’te Fethiye’de kurulan Alfa Spor’un eğitim yaklaşımı ve teknik ekibi.",
};
export default function Club() {
  return (
    <>
      <PageIntro
        title="Bir kulüpten fazlası."
        eyebrow="AİDİYETLE KURULUR. GÜVENLE BÜYÜR."
        description="Fethiye’de başlayan, her oyuncumuzla büyüyen bir gelişim yolculuğu."
      />
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
                  <Visual className="staff-visual" />
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
