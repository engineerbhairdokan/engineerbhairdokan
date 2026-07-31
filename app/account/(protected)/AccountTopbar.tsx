"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export default function AccountTopbar({ name }: { name: string }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="spec-readout text-xs text-gold-600">My Account</p>
        <h1 className="font-display font-bold text-2xl text-ink">Hi, {name}</h1>
      </div>
      <button onClick={signOut} className="flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink hover:bg-cream">
        <LogOut className="h-4 w-4" /> Sign Out
      </button>
    </div>
  );
}
