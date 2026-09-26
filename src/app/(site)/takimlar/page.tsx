import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { AcademyExplorer } from "@/components/academy-explorer";
export const metadata: Metadata = {
  title: "Takımlarımız",
  description:
    "Alfa Spor yaş gruplarını keşfedin. Oyuncu kadroları, sahadaki mevkileri ve takımlardan haberler.",
};
export default async function Teams() {
  const content = await getContent();
  return <AcademyExplorer teams={content.teams} />;
}
