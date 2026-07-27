"use client";

import { useState, useTransition } from "react";
import { updateReturnCharge } from "../actions";
import { AlertTriangle } from "lucide-react";

export default function ReturnChargeEditor({ orderId, currentCharge }: { orderId: string; currentCharge: number }) {
  const [amount, setAmount] = useState(currentCharge);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <h2 className="font-display font-bold text-ink">Return / Courier Loss</h2>
      </div>
      <p className="text-xs text-ink/50 mb-3">
        Couriers often still charge a fee even when a parcel is returned. Record the actual amount here —
        it's counted as a loss in your profit &amp; loss reports.
      </p>
      <div className="flex gap-2">
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="flex-1 rounded-xl border border-ink/15 px-3 py-2 text-sm"
        />
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await updateReturnCharge(orderId, amount);
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            })
          }
          className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-cream hover:bg-ink-700 disabled:opacity-50"
        >
          {saved ? "Saved ✓" : "Save"}
        </button>
      </div>
    </div>
  );
}
