import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";
import { ArrowLeft } from "lucide-react";
import AdjustBalanceForm from "./AdjustBalanceForm";
import StatusToggle from "./StatusToggle";

export const dynamic = "force-dynamic";

export default async function InvestorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [investorResult, balanceResult, investmentsResult, ledgerResult, depositsResult] = await Promise.all([
    supabase.from("investors").select("*").eq("id", id).single(),
    supabase.from("investor_balances").select("balance").eq("investor_id", id).maybeSingle(),
    supabase.from("product_investments").select("id, amount, profit_percent, loss_percent, status, invested_at, stock_at_investment, products(name, current_stock)").eq("investor_id", id).order("invested_at", { ascending: false }),
    supabase.from("investor_ledger").select("id, entry_type, amount, note, created_at").eq("investor_id", id).order("created_at", { ascending: false }).limit(30),
    supabase.from("investor_deposits").select("id, amount, status, created_at").eq("investor_id", id).order("created_at", { ascending: false }).limit(10),
  ]);

  const investor: any = investorResult.data;
  if (!investor) notFound();

  const balance = Number((balanceResult.data as any)?.balance ?? 0);
  const investments = (investmentsResult.data ?? []) as any[];
  const ledger = (ledgerResult.data ?? []) as any[];
  const deposits = (depositsResult.data ?? []) as any[];

  return (
    <div className="space-y-5 max-w-4xl">
      <Link href="/admin/investors" className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> All Investors
      </Link>

      <div className="rounded-2xl border border-ink/10 bg-white p-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">{investor.name}</h1>
          <p className="text-sm text-ink/60 mt-1">{investor.phone}{investor.email ? ` · ${investor.email}` : ""}</p>
          <div className="mt-2"><StatusToggle investorId={investor.id} status={investor.status} /></div>
        </div>
        <div className="text-right">
          <p className="text-xs text-ink/40">Current Balance</p>
          <p className="font-display font-bold text-2xl text-ink">{formatBDT(balance)}</p>
        </div>
      </div>

      <AdjustBalanceForm investorId={investor.id} />

      <div>
        <h2 className="font-display font-bold text-ink mb-3">Investments</h2>
        <div className="space-y-2">
          {investments.map((inv) => (
            <div key={inv.id} className="rounded-xl border border-ink/10 bg-white p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-ink text-sm">{inv.products?.name}</p>
                <p className="text-xs text-ink/40">{formatBDT(inv.amount)} · {inv.profit_percent}%/{inv.loss_percent}% · stock {inv.products?.current_stock}/{inv.stock_at_investment}</p>
              </div>
              <span className="text-xs rounded-full bg-cream px-2 py-1 capitalize">{inv.status.replace(/_/g, " ")}</span>
            </div>
          ))}
          {investments.length === 0 && <p className="text-sm text-ink/40">No investments yet.</p>}
        </div>
      </div>

      <div>
        <h2 className="font-display font-bold text-ink mb-3">Deposits</h2>
        <div className="space-y-2">
          {deposits.map((d) => (
            <div key={d.id} className="rounded-xl border border-ink/10 bg-white p-3 flex items-center justify-between text-sm">
              <span className="text-ink">{formatBDT(d.amount)}</span>
              <span className={`text-xs rounded-full px-2 py-1 capitalize ${d.status === "approved" ? "bg-emerald-100 text-emerald-700" : d.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{d.status}</span>
              <span className="text-ink/40 text-xs">{new Date(d.created_at).toLocaleDateString("en-GB")}</span>
            </div>
          ))}
          {deposits.length === 0 && <p className="text-sm text-ink/40">No deposits yet.</p>}
        </div>
      </div>

      <div>
        <h2 className="font-display font-bold text-ink mb-3">Ledger</h2>
        <div className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream text-left text-xs text-ink/50 spec-readout">
              <tr><th className="px-4 py-2.5">Type</th><th className="px-4 py-2.5">Note</th><th className="px-4 py-2.5">Amount</th><th className="px-4 py-2.5">Date</th></tr>
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
              {ledger.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-ink/40">No transactions yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
