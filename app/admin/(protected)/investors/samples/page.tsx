import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";
import StatusUpdateSelect from "./StatusUpdateSelect";

export const dynamic = "force-dynamic";

export default async function InvestorSamplesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("investor_sample_claims")
    .select("id, delivery_method, district, full_address, delivery_charge, status, created_at, investors(name, phone), products(name), pickup_locations(name)")
    .order("created_at", { ascending: false });

  const claims = (data ?? []) as any[];

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <p className="spec-readout text-xs text-gold-600">Investors</p>
        <h1 className="font-display font-bold text-2xl text-ink">Sample Claims</h1>
        <p className="text-sm text-ink/50 mt-1">
          Free product samples claimed by investors — these never appear in sales/revenue reports.
        </p>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left text-xs text-ink/50 spec-readout">
            <tr>
              <th className="px-4 py-3">Investor</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Delivery</th>
              <th className="px-4 py-3">Charge</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((c) => (
              <tr key={c.id} className="border-t border-ink/5">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{c.investors?.name}</p>
                  <p className="text-xs text-ink/40">{c.investors?.phone}</p>
                </td>
                <td className="px-4 py-3 text-ink">{c.products?.name}</td>
                <td className="px-4 py-3 text-ink/70">
                  {c.delivery_method === "pickup"
                    ? `Pickup — ${c.pickup_locations?.name ?? "—"}`
                    : `${c.district}: ${c.full_address}`}
                </td>
                <td className="px-4 py-3 text-ink">{formatBDT(c.delivery_charge)}</td>
                <td className="px-4 py-3">
                  <StatusUpdateSelect claimId={c.id} status={c.status} />
                </td>
                <td className="px-4 py-3 text-ink/40">{new Date(c.created_at).toLocaleDateString("en-GB")}</td>
              </tr>
            ))}
            {claims.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-ink/40">No sample claims yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
