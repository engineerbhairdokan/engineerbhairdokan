"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Menu } from "lucide-react";

export default function AdminTopbar({
  name,
  role,
  onMenuClick,
}: {
  name: string;
  role: string;
  onMenuClick?: () => void;
}) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between border-b border-ink/10 bg-white px-5 py-3">
      <button onClick={onMenuClick} className="text-ink lg:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-ink leading-tight">{name}</p>
          <p className="text-xs text-ink/40 capitalize leading-tight">{role.replace("_", " ")}</p>
        </div>
        <button
          onClick={signOut}
          aria-label="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink/60 hover:bg-cream"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
