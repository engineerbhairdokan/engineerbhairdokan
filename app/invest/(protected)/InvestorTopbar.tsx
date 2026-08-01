"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatBDT } from "@/lib/pricing";
import { LogOut } from "lucide-react";

export default function InvestorTopbar({
  name,
  balance,
  status,
}: {
  name: string;
  balance: number;
  status: string;
}) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div>
        <p className="spec-readout text-xs text-gold-600">Investor Dashboard</p>
        <h1 className="font-display font-bold text-2xl text-ink">Hi, {name}</h1>
        {status === "suspended" && (
          <p className="mt-1 text-xs font-medium text-red-600">Your investor account is suspended. Contact admin.</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-ink/10 bg-white px-4 py-2 text-right">
          <p className="text-[10px] text-ink/40">Balance</p>
          <p className="font-display font-bold text-ink">{formatBDT(balance)}</p>
        </div>
        <button onClick={signOut} className="flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink hover:bg-cream">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
