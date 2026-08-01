"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adjustInvestorBalance } from "../actions";
import { Loader2 } from "lucide-react";

export default function AdjustBalanceForm({ investorId }: { investorId: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await adjustInvestorBalance(investorId, Number(amount), note);
      if (result?.error) setError(result.error);
      else {
        setAmount("");
        setNote("");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-ink/10 bg-white p-4">
      <p className="spec-readout text-xs text-gold-600 mb-2">Manual Adjustment</p>
      <div className="grid gap-2 sm:grid-cols-[140px_1fr_auto]">
        <input
          type="number"
          placeholder="Amount (+/-)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-xl border border-ink/15 px-3 py-2 text-sm"
          required
        />
        <input
          placeholder="Reason (e.g. correction, bonus)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="rounded-xl border border-ink/15 px-3 py-2 text-sm"
          required
        />
        <button
          disabled={isPending}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-sm font-medium text-cream hover:bg-ink-700 disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Apply
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      <p className="text-xs text-ink/40 mt-2">Use a positive number to credit, negative to debit. This is logged in the ledger and notifies the investor.</p>
    </form>
  );
}
