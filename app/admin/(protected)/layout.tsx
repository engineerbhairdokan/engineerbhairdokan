import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { getContactInfo } from "@/lib/queries";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();

  if (!admin || !admin.is_active) {
    redirect("/admin/login");
  }

  const contact = await getContactInfo();

  return (
    <AdminShell name={admin.name} role={admin.role} businessName={contact?.business_name ?? "Engineer Bhai'r Dokan"} logoUrl={contact?.logo_url ?? null}>
      {children}
    </AdminShell>
  );
}
