"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Award } from "lucide-react";

export default function ApplyMembershipButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function apply() {
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.rpc("apply_for_membership");
      if (error) {
        setError(error.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <button
        onClick={apply}
        disabled={isPending}
        className="flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-display font-bold text-ink hover:bg-gold-600 disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
        Activate Membership (uses 6 points)
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
