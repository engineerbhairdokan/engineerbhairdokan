import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function InvestorTransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: investorRow } = await supabase.from("investors").select("id").eq("auth_user_id", user!.id).single();
  const investorId = (investorRow as any)?.id;

  const { data } = await supabase
    .from("investor_ledger")
    .select("id, entry_type, amount, note, created_at")
    .eq("investor_id", investorId)
    .order("created_at", { ascending: false })
    .limit(200);
  const ledger = (data ?? []) as any[];

  return (
    <section>
      <h2 className="font-display font-bold text-ink mb-3">Transaction History</h2>
      <div className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left text-xs text-ink/50 spec-readout">
            <tr>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">Note</th>
              <th className="px-4 py-2.5">Amount</th>
              <th className="px-4 py-2.5">Date</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((l) => (
              <tr key={l.id} className="border-t border-ink/5">
                <td className="px-4 py-2.5 capitalize text-ink">{l.entry_type}</td>
                <td className="px-4 py-2.5 text-ink/60">{l.note}</td>
                <td className={`px-4 py-2.5 font-medium ${Number(l.amount) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {Number(l.amount) >= 0 ? "+" : ""}{formatBDT(Number(l.amount))}
                </td>
                <td className="px-4 py-2.5 text-ink/40">{new Date(l.created_at).toLocaleDateString("en-GB")}</td>
              </tr>
            ))}
            {ledger.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-ink/40">No transactions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
