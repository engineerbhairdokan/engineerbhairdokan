"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Award, Check } from "lucide-react";

type Customer = {
  id: string; name: string; phone: string; loyalty_points: number;
  membership_status: string; membership_discount_percent: number;
  membership_valid_until: string | null; membership_card_number: string | null;
};

export default function MembershipsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [discountInputs, setDiscountInputs] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("customers")
      .select("id, name, phone, loyalty_points, membership_status, membership_discount_percent, membership_valid_until, membership_card_number")
      .neq("membership_status", "none")
      .order("membership_status");
    setCustomers((data as unknown as Customer[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  function approve(customerId: string) {
    setError(null);
    const discount = discountInputs[customerId] ?? 5;
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.rpc("approve_membership", { p_customer_id: customerId, p_discount_percent: discount });
      if (error) { setError(error.message); return; }
      load();
    });
  }

  const pending = customers.filter((c) => c.membership_status === "pending");
  const active = customers.filter((c) => c.membership_status === "active");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="spec-readout text-xs text-gold-600">Loyalty Program</p>
        <h1 className="font-display font-bold text-2xl text-ink">Bhai Brother Memberships</h1>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <h2 className="font-display font-bold text-ink mb-3 flex items-center gap-2">
          <Award className="h-4 w-4 text-gold-600" /> Pending Applications
        </h2>
        <div className="space-y-2">
          {pending.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-2xl border border-gold bg-gold-100 p-4">
              <div>
                <p className="font-medium text-ink">{c.name}</p>
                <p className="text-xs text-ink/50">{c.phone} · {c.loyalty_points} points</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-xs text-ink/60">
                  Discount
                  <input
                    type="number"
                    min={5}
                    step="0.5"
                    defaultValue={5}
                    onChange={(e) => setDiscountInputs({ ...discountInputs, [c.id]: Number(e.target.value) })}
                    className="w-16 rounded-lg border border-ink/15 px-2 py-1 text-center"
                  />
                  %
                </label>
                <button
                  onClick={() => approve(c.id)}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-medium text-cream hover:bg-ink-700 disabled:opacity-60"
                >
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  Approve
                </button>
              </div>
            </div>
          ))}
          {pending.length === 0 && <p className="text-sm text-ink/40">No pending applications.</p>}
        </div>
      </div>

      <div>
        <h2 className="font-display font-bold text-ink mb-3">Active Members</h2>
        <div className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream text-left text-xs text-ink/50 spec-readout">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Card #</th><th className="px-4 py-3">Discount</th><th className="px-4 py-3">Valid Until</th><th className="px-4 py-3">Points</th></tr>
            </thead>
            <tbody>
              {active.map((c) => (
                <tr key={c.id} className="border-t border-ink/5">
                  <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink/50">{c.membership_card_number}</td>
                  <td className="px-4 py-3">{c.membership_discount_percent}%</td>
                  <td className="px-4 py-3 text-ink/60">{c.membership_valid_until ? new Date(c.membership_valid_until).toLocaleDateString("en-GB") : "—"}</td>
                  <td className="px-4 py-3">{c.loyalty_points}</td>
                </tr>
              ))}
              {active.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-ink/40">No active members yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
