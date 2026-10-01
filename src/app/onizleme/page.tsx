import { notFound, redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin/auth";
import { getDb } from "@/lib/mongodb";
import { previewContext } from "@/lib/admin/preview-context";
import { settingsSchema } from "@/lib/admin/schema";
import Home from "../(site)/page";
import Club from "../(site)/kulubumuz/page";
import Teams from "../(site)/takimlar/page";
import News from "../(site)/haberler/page";
import Matches from "../(site)/maclar/page";
import Contact from "../(site)/iletisim/page";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
export const metadata = { title: "Taslak önizlemesi", robots: { index: false, follow: false } };
export default async function Preview({ searchParams }: { searchParams: Promise<{ page?: string; revision?: string }> }) {
  const user = await getAdmin();
  if (!user) redirect("/admin/giris");
  const { page = "home", revision } = await searchParams;
  const record = await (await getDb()).collection<{ _id: string; userId: string; data: unknown; expiresAt: Date }>("adminPreviews").findOne({ _id: revision ?? "", userId: user.id, expiresAt: { $gt: new Date() } });
  const data = settingsSchema.safeParse(record?.data);
  if (!data.success) notFound();
  return previewContext.run(data.data, async () => {
    const pages = { home: Home, club: Club, teams: Teams, news: News, matches: Matches, contact: Contact };
    const render = Object.hasOwn(pages, page) ? pages[page as keyof typeof pages] : Home;
    const content = await render({ searchParams: Promise.resolve({}) });
    const footer = await SiteFooter();
    return <><SiteHeader /><main id="main">{content}</main>{footer}</>;
  });
}
