import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";
import WithdrawalReviewCard from "./WithdrawalReviewCard";

export const dynamic = "force-dynamic";

export default async function WithdrawalsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("investor_withdrawal_requests")
    .select("id, requested_amount, status, admin_note, created_at, investors(id, name, phone, payout_bank_name, payout_account_name, payout_account_number), product_investments(products(name))")
    .order("created_at", { ascending: false });

  const requests = (data ?? []) as any[];
  const pending = requests.filter((r) => r.status === "pending");
  const resolved = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="spec-readout text-xs text-gold-600">Investors</p>
        <h1 className="font-display font-bold text-2xl text-ink">Withdrawal Requests</h1>
        <p className="text-sm text-ink/50 mt-1">
          Discuss payout details with the investor directly, then mark as Paid once the money is sent.
        </p>
      </div>

      <section>
        <h2 className="font-display font-bold text-ink mb-3">Pending ({pending.length})</h2>
        <div className="space-y-3">
          {pending.map((r) => <WithdrawalReviewCard key={r.id} request={r} />)}
          {pending.length === 0 && <p className="text-sm text-ink/40">No pending withdrawal requests.</p>}
        </div>
      </section>

      {resolved.length > 0 && (
        <section>
          <h2 className="font-display font-bold text-ink mb-3">History</h2>
          <div className="space-y-2">
            {resolved.map((r) => (
              <div key={r.id} className="rounded-xl border border-ink/10 bg-white p-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-ink">{r.investors?.name}</span>
                  <span className="text-ink/40 ml-2">{formatBDT(r.requested_amount)}</span>
                </div>
                <span className={`text-xs rounded-full px-2 py-1 capitalize ${r.status === "paid" ? "bg-emerald-100 text-emerald-700" : r.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
