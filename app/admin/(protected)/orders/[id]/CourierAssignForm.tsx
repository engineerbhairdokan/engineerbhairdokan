"use client";

import { useState, useTransition } from "react";
import { assignCourier } from "../actions";

export default function CourierAssignForm({
  orderId,
  couriers,
  currentCourierId,
  currentTracking,
}: {
  orderId: string;
  couriers: { id: string; name: string }[];
  currentCourierId: string | null;
  currentTracking: string;
}) {
  const [courierId, setCourierId] = useState(currentCourierId ?? "");
  const [tracking, setTracking] = useState(currentTracking);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-3">
      <select value={courierId} onChange={(e) => setCourierId(e.target.value)} className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm">
        <option value="">No courier assigned</option>
        {couriers.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <input
        value={tracking}
        onChange={(e) => setTracking(e.target.value)}
        placeholder="Tracking number"
        className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm"
      />
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await assignCourier(orderId, courierId || null, tracking);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          })
        }
        className="w-full rounded-xl bg-ink py-2 text-sm font-medium text-cream hover:bg-ink-700 disabled:opacity-50"
      >
        {saved ? "Saved ✓" : "Save Courier Info"}
      </button>
    </div>
  );
}
