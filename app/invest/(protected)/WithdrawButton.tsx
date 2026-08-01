"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatBDT } from "@/lib/pricing";
import { Loader2 } from "lucide-react";

export default function WithdrawButton({
  investmentId,
  eligible,
  soldPct,
  maxAmount,
}: {
  investmentId: string;
  eligible: boolean;
  soldPct: number;
  maxAmount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(maxAmount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("request_investment_withdrawal", {
      p_product_investment_id: investmentId,
      p_requested_amount: amount,
    });
    setLoading(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    fetch("/api/investor-notifications/flush", { method: "POST" }).catch(() => {});
    setOpen(false);
    router.refresh();
  }

  if (!eligible) {
    return (
      <span className="text-xs text-ink/40">
        Withdrawal unlocks at 90% sold (currently {soldPct.toFixed(0)}%)
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-cream hover:bg-ink-700"
      >
        Request Withdrawal
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5">
            <p className="font-display font-bold text-ink">Request Withdrawal</p>
            <p className="text-xs text-ink/50 mt-1 mb-4">
              This submits a request — our team will contact you to confirm and process it.
            </p>
            <label className="block mb-3">
              <span className="mb-1 block text-xs font-medium text-ink/60">Amount</span>
              <input
                type="number"
                min={1}
                max={maxAmount}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm"
              />
              <span className="mt-1 block text-xs text-ink/40">Up to {formatBDT(maxAmount)}</span>
            </label>
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={submit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gold py-2 text-sm font-medium text-ink hover:bg-gold-600 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Request
              </button>
              <button onClick={() => setOpen(false)} className="rounded-xl border border-ink/15 px-4 py-2 text-sm text-ink hover:bg-cream">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
