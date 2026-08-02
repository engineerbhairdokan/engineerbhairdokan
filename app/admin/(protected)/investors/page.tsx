import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";
import { TrendingUp, FileClock, Wallet, Settings as SettingsIcon, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InvestorsPage() {
  const supabase = await createClient();

  const [investorsResult, balancesResult, pendingDepositsResult, pendingWithdrawalsResult] = await Promise.all([
    supabase.from("investors").select("id, name, phone, email, status, created_at").order("created_at", { ascending: false }),
    supabase.from("investor_balances").select("investor_id, balance"),
    supabase.from("investor_deposits").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("investor_withdrawal_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const investors = (investorsResult.data ?? []) as any[];
  const balances = new Map(((balancesResult.data as any[]) ?? []).map((b) => [b.investor_id, Number(b.balance)]));
  const pendingDeposits = pendingDepositsResult.count ?? 0;
  const pendingWithdrawals = pendingWithdrawalsResult.count ?? 0;
  const pendingApprovals = investors.filter((i) => i.status === "pending_approval").length;

  const totalBalance = [...balances.values()].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="spec-readout text-xs text-gold-600">Investors</p>
          <h1 className="font-display font-bold text-2xl text-ink">Investor Management</h1>
        </div>
        <Link href="/admin/investors/settings" className="flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink hover:bg-cream">
          <SettingsIcon className="h-4 w-4" /> Settings
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Total Investors" value={investors.length.toString()} icon={TrendingUp} />
        <StatCard label="Pending Approval" value={pendingApprovals.toString()} icon={UserCheck} highlight={pendingApprovals > 0} />
        <StatCard label="Total Balance Held" value={formatBDT(totalBalance)} icon={Wallet} />
        <Link href="/admin/investors/deposits">
          <StatCard label="Pending Deposits" value={pendingDeposits.toString()} icon={FileClock} highlight={pendingDeposits > 0} />
        </Link>
        <Link href="/admin/investors/withdrawals">
          <StatCard label="Pending Withdrawals" value={pendingWithdrawals.toString()} icon={FileClock} highlight={pendingWithdrawals > 0} />
        </Link>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left text-xs text-ink/50 spec-readout">
            <tr>
              <th className="px-4 py-3">Investor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {investors.map((inv) => (
              <tr key={inv.id} className="border-t border-ink/5 hover:bg-cream/50">
                <td className="px-4 py-3">
                  <Link href={`/admin/investors/${inv.id}`} className="font-medium text-ink hover:text-gold-600">{inv.name}</Link>
                  <p className="text-ink/40 text-xs">{inv.phone}{inv.email ? ` · ${inv.email}` : ""}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                    inv.status === "active" ? "bg-emerald-100 text-emerald-700" :
                    inv.status === "pending_approval" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {inv.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-ink">{formatBDT(balances.get(inv.id) ?? 0)}</td>
                <td className="px-4 py-3 text-ink/50">{new Date(inv.created_at).toLocaleDateString("en-GB")}</td>
              </tr>
            ))}
            {investors.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-ink/40">No investors have signed up yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, highlight }: { label: string; value: string; icon: any; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? "border-amber-300 bg-amber-50" : "border-ink/10 bg-white"}`}>
      <div className="flex items-center gap-1.5 text-ink/40">
        <Icon className="h-3.5 w-3.5" />
        <p className="spec-readout text-[10px]">{label}</p>
      </div>
      <p className="font-display font-bold text-xl text-ink mt-1">{value}</p>
    </div>
  );
}
