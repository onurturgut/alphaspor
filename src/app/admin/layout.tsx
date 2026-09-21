import type { Metadata } from "next";
import "./admin.css";
import { ThemeToggle } from "@/components/theme-toggle";
export const metadata: Metadata = {
  title: "Yönetim paneli",
  robots: { index: false, follow: false },
};
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-root">
      <div className="admin-theme-control">
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
