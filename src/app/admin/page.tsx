import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin/auth";
import { AdminPanel } from "@/components/admin/panel";
import { listAdmin } from "@/lib/admin/data";
import { sectionNames, type Section } from "@/lib/admin/schema";
export default async function AdminPage() {
  const user = await getAdmin();
  if (!user) redirect("/admin/giris");
  const entries = await Promise.all((Object.keys(sectionNames) as Section[]).map(async key => [key, await listAdmin(key)]));
  return <AdminPanel email={user.email} initialData={JSON.parse(JSON.stringify(Object.fromEntries(entries)))} />;
}
