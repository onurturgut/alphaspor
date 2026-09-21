import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { PageIntro } from "@/components/page-intro";
import { TeamCards } from "@/components/ui";
export const metadata: Metadata = {
  title: "Takımlarımız",
  description:
    "Alfa Spor yaş gruplarını keşfedin. Oyuncu kadroları, sahadaki mevkileri ve takımlardan haberler.",
};
export default async function Teams() {
  const content = await getContent();
  return (
    <>
      <PageIntro {...content.pages.teams} />
      <section className="container page-content">
        <TeamCards teams={content.teams} />
      </section>
    </>
  );
}
