"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CalendarPlus } from "lucide-react";

export default function ExtendMembershipForm({ availablePoints }: { availablePoints: number }) {
  const router = useRouter();
  const [months, setMonths] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function extend() {
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.rpc("extend_membership", { p_months: months });
      if (error) {
        setError(error.message);
        return;
      }
      router.refresh();
    });
  }

  if (availablePoints < 1) {
    return <p className="text-xs text-ink/40">Earn more points (100৳ spent = 1 point) to extend your membership.</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={1}
        max={availablePoints}
        value={months}
        onChange={(e) => setMonths(Math.max(1, Math.min(availablePoints, Number(e.target.value))))}
        className="w-16 rounded-lg border border-ink/15 px-2 py-1.5 text-center text-sm"
      />
      <span className="text-xs text-ink/50">month(s) — uses {months} point(s)</span>
      <button
        onClick={extend}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-cream hover:bg-ink-700 disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CalendarPlus className="h-3.5 w-3.5" />}
        Extend
      </button>
      {error && <p className="text-xs text-red-600 w-full">{error}</p>}
    </div>
  );
}
