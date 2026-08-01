import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";
import DepositReviewCard from "./DepositReviewCard";

export const dynamic = "force-dynamic";

export default async function DepositsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("investor_deposits")
    .select("id, amount, screenshot_url, transaction_note, status, admin_note, created_at, investors(id, name, phone)")
    .order("created_at", { ascending: false });

  const deposits = (data ?? []) as any[];

  const withSignedUrls = await Promise.all(
    deposits.map(async (d) => {
      const { data: signed } = await supabase.storage.from("investor-deposits").createSignedUrl(d.screenshot_url, 3600);
      return { ...d, signedUrl: signed?.signedUrl ?? null };
    })
  );

  const pending = withSignedUrls.filter((d) => d.status === "pending");
  const resolved = withSignedUrls.filter((d) => d.status !== "pending");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="spec-readout text-xs text-gold-600">Investors</p>
        <h1 className="font-display font-bold text-2xl text-ink">Deposit Review</h1>
      </div>

      <section>
        <h2 className="font-display font-bold text-ink mb-3">Pending ({pending.length})</h2>
        <div className="space-y-3">
          {pending.map((d) => <DepositReviewCard key={d.id} deposit={d} />)}
          {pending.length === 0 && <p className="text-sm text-ink/40">No pending deposits.</p>}
        </div>
      </section>

      {resolved.length > 0 && (
        <section>
          <h2 className="font-display font-bold text-ink mb-3">History</h2>
          <div className="space-y-2">
            {resolved.map((d) => (
              <div key={d.id} className="rounded-xl border border-ink/10 bg-white p-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-ink">{d.investors?.name}</span>
                  <span className="text-ink/40 ml-2">{formatBDT(d.amount)}</span>
                </div>
                <span className={`text-xs rounded-full px-2 py-1 capitalize ${d.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{d.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
