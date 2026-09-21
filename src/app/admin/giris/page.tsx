import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin/auth";
import { LoginForm } from "@/components/admin/login-form";
export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return <LoginForm />;
}
