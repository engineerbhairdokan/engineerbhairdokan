"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reviewDeposit } from "../actions";
import { formatBDT } from "@/lib/pricing";
import { Check, X, Loader2 } from "lucide-react";

export default function DepositReviewCard({ deposit }: { deposit: any }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function resolve(status: "approved" | "rejected") {
    startTransition(async () => {
      await reviewDeposit(deposit.id, status, note);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4 flex flex-col sm:flex-row gap-4">
      {deposit.signedUrl ? (
        <a href={deposit.signedUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
          <img src={deposit.signedUrl} alt="Payment screenshot" className="h-32 w-32 rounded-xl object-cover border border-ink/10" />
        </a>
      ) : (
        <div className="h-32 w-32 shrink-0 rounded-xl bg-cream flex items-center justify-center text-xs text-ink/30">No image</div>
      )}

      <div className="flex-1 space-y-2">
        <div>
          <p className="font-medium text-ink">{deposit.investors?.name} <span className="text-ink/40 font-normal">· {deposit.investors?.phone}</span></p>
          <p className="font-display font-bold text-lg text-ink">{formatBDT(deposit.amount)}</p>
          {deposit.transaction_note && <p className="text-xs text-ink/50">Note: {deposit.transaction_note}</p>}
          <p className="text-xs text-ink/40">{new Date(deposit.created_at).toLocaleString("en-GB")}</p>
        </div>
        <input
          placeholder="Admin note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-lg border border-ink/15 px-3 py-1.5 text-xs"
        />
        <div className="flex gap-2">
          <button
            disabled={isPending}
            onClick={() => resolve("approved")}
            className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Approve
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
    </div>
  );
}
