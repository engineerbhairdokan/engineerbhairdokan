import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();

  if (!admin || !admin.is_active) {
    redirect("/admin/login");
  }

  return (
    <AdminShell name={admin.name} role={admin.role}>
      {children}
    </AdminShell>
  );
}
