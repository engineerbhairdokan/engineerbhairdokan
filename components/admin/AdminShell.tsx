"use client";

import { useState } from "react";
import AdminSidebar from "./Sidebar";
import AdminTopbar from "./Topbar";

export default function AdminShell({
  name,
  role,
  businessName,
  logoUrl,
  children,
}: {
  name: string;
  role: string;
  businessName: string;
  logoUrl: string | null;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex bg-cream min-h-screen">
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} businessName={businessName} logoUrl={logoUrl} />
      <div className="flex-1 min-w-0">
        <AdminTopbar name={name} role={role} onMenuClick={() => setMobileOpen(true)} />
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
