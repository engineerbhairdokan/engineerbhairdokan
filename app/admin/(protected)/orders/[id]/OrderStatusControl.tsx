"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "../actions";

const STATUSES = ["pending","confirmed","processing","packed","handed_to_courier","in_transit","delivered","returned","cancelled"] as const;

export default function OrderStatusControl({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm capitalize">
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
        ))}
      </select>
      <button
        disabled={isPending || status === currentStatus}
        onClick={() =>
          startTransition(async () => {
            const result = await updateOrderStatus(orderId, status as any);
            if (result?.error) setError(result.error);
          })
        }
        className="w-full rounded-xl bg-ink py-2 text-sm font-medium text-cream hover:bg-ink-700 disabled:opacity-50"
      >
        Update Status
      </button>
      {status === "confirmed" && (
        <p className="text-xs text-ink/40">Confirming will automatically deduct stock.</p>
      )}
      {(status === "returned" || status === "cancelled") && (
        <p className="text-xs text-ink/40">This will automatically restock the items.</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
