"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resolveWithdrawal } from "../actions";
import { formatBDT } from "@/lib/pricing";
import { Check, X, Banknote, Loader2 } from "lucide-react";

export default function WithdrawalReviewCard({ request }: { request: any }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function resolve(status: "approved" | "rejected" | "paid") {
    startTransition(async () => {
      await resolveWithdrawal(request.id, status, note);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4 space-y-2">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <p className="font-medium text-ink">{request.investors?.name} <span className="text-ink/40 font-normal">· {request.investors?.phone}</span></p>
          <p className="text-xs text-ink/50">Product: {request.product_investments?.products?.name}</p>
          <p className="text-xs text-ink/40">{new Date(request.created_at).toLocaleString("en-GB")}</p>
        </div>
        <p className="font-display font-bold text-lg text-ink">{formatBDT(request.requested_amount)}</p>
      </div>

      {(request.investors?.payout_bank_name || request.investors?.payout_account_number) && (
        <p className="text-xs text-ink/50">
          Payout to: {request.investors?.payout_bank_name} — {request.investors?.payout_account_name} — {request.investors?.payout_account_number}
        </p>
      )}

      <input
        placeholder="Admin note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full rounded-lg border border-ink/15 px-3 py-1.5 text-xs"
      />

      <div className="flex flex-wrap gap-2">
        <button
          disabled={isPending}
          onClick={() => resolve("paid")}
          className="flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-cream hover:bg-ink-700 disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Banknote className="h-3.5 w-3.5" />} Mark as Paid
        </button>
        <button
          disabled={isPending}
          onClick={() => resolve("approved")}
          className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          <Check className="h-3.5 w-3.5" /> Approve (not yet paid)
        </button>
        <button
          disabled={isPending}
          onClick={() => resolve("rejected")}
          className="flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          <X className="h-3.5 w-3.5" /> Reject
        </button>
      </div>
    </div>
  );
}
