import type { Metadata } from "next";
import content from "@/data/content.json";
import { PageIntro } from "@/components/page-intro";
import { TeamCards } from "@/components/ui";
export const metadata: Metadata = {
  title: "Takımlarımız",
  description:
    "Alfa Spor yaş gruplarını keşfedin. Oyuncu kadroları, sahadaki mevkileri ve takımlardan haberler.",
};
export default function Teams() {
  return (
    <>
      <PageIntro
        title="Aynı arma. Aynı heyecan."
        eyebrow="TAKIMLARIMIZ"
        description="Her yaşta yeni bir başlangıç. Takımını seç, Alfa ailesini yakından tanı."
      />
      <section className="container page-content">
        <TeamCards teams={content.teams} />
      </section>
    </>
  );
}
