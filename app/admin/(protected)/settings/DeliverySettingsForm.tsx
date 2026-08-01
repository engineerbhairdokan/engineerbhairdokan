"use client";

import { useState, useTransition } from "react";
import { updateDeliverySettings } from "./actions";

export default function DeliverySettingsForm({ initial }: { initial: { insideDhaka: number; outsideDhaka: number } }) {
  const [insideDhaka, setInsideDhaka] = useState(initial.insideDhaka);
  const [outsideDhaka, setOutsideDhaka] = useState(initial.outsideDhaka);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink/60">Inside Dhaka Charge (৳)</span>
        <input type="number" value={insideDhaka} onChange={(e) => setInsideDhaka(Number(e.target.value))} className="input" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink/60">Outside Dhaka Charge (৳)</span>
        <input type="number" value={outsideDhaka} onChange={(e) => setOutsideDhaka(Number(e.target.value))} className="input" />
      </label>
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await updateDeliverySettings({ insideDhaka, outsideDhaka });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          })
        }
        className="sm:col-span-2 rounded-xl bg-ink py-2.5 text-sm font-medium text-cream hover:bg-ink-700 disabled:opacity-60"
      >
        {saved ? "Saved ✓" : "Save Delivery Charges"}
      </button>
      <p className="sm:col-span-2 text-xs text-ink/40">
        These apply instantly to every new website and manual order — no code changes needed.
      </p>
      <style jsx global>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid rgba(27,36,51,0.15); padding: 0.55rem 0.85rem; font-size: 0.9rem; background: white; }
        .input:focus { outline: none; border-color: #f3a93b; }
      `}</style>
    </div>
  );
}
