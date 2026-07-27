import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminTopbar from "@/components/admin/Topbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();

  // Not an admin_users row at all, or deactivated — bounce to login.
  // (middleware.ts already handles "not logged in at all".)
  if (!admin || !admin.is_active) {
    redirect("/admin/login");
  }

  return (
    <div className="flex bg-cream min-h-screen">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <AdminTopbar name={admin.name} role={admin.role} />
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
