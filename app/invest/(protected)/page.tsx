import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";
import StatusBadge from "@/components/admin/StatusBadge";
import WithdrawButton from "./WithdrawButton";
import { Package, Bell, TrendingUp, TrendingDown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InvestorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: investorRow } = await supabase.from("investors").select("id").eq("auth_user_id", user!.id).single();
  const investorId = (investorRow as any)?.id;

  const [investmentsResult, ledgerResult, notifsResult] = await Promise.all([
    supabase
      .from("product_investments")
      .select("id, product_id, amount, profit_percent, loss_percent, stock_at_investment, status, invested_at, products(name, current_stock)")
      .eq("investor_id", investorId)
      .order("invested_at", { ascending: false }),
    supabase
      .from("investor_ledger")
      .select("id, entry_type, amount, note, created_at")
      .eq("investor_id", investorId)
      .order("created_at", { ascending: false })
      .limit(15),
    supabase
      .from("investor_notifications")
      .select("id, title, body, notif_type, is_read, created_at")
      .eq("investor_id", investorId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const investments = (investmentsResult.data ?? []) as any[];
  const ledger = (ledgerResult.data ?? []) as any[];
  const notifications = (notifsResult.data ?? []) as any[];

  const investmentIds = investments.map((i) => i.id);
  let plMap = new Map<string, number>();
  if (investmentIds.length > 0) {
    const { data: plRows } = await supabase
      .from("investor_ledger")
      .select("product_investment_id, amount")
      .in("product_investment_id", investmentIds)
      .in("entry_type", ["profit", "loss"]);
    for (const row of (plRows as any[]) ?? []) {
      plMap.set(row.product_investment_id, (plMap.get(row.product_investment_id) ?? 0) + Number(row.amount));
    }
  }

  // Recent orders touching invested products (purchase/shipping visibility)
  const productIds = [...new Set(investments.map((i) => i.product_id))];
  let recentOrders: any[] = [];
  if (productIds.length > 0) {
    const { data } = await supabase
      .from("order_items")
      .select("id, quantity, product_id, products(name), orders(order_number, status, created_at)")
      .in("product_id", productIds)
      .order("id", { ascending: false })
      .limit(10);
    recentOrders = data ?? [];
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display font-bold text-ink mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-gold-600" /> My Investments
        </h2>
        {investments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/20 py-10 text-center text-ink/40">
            No investments yet. Your admin will record an investment for you once your funds are allocated to a product.
          </div>
        ) : (
          <div className="space-y-3">
            {investments.map((inv) => {
              const soldPct = inv.stock_at_investment > 0
                ? Math.min(100, Math.max(0, ((inv.stock_at_investment - (inv.products?.current_stock ?? 0)) / inv.stock_at_investment) * 100))
                : 0;
              const pl = plMap.get(inv.id) ?? 0;
              const eligible = soldPct >= 90 && inv.status === "active";
              return (
                <div key={inv.id} className="rounded-2xl border border-ink/10 bg-white p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-medium text-ink">{inv.products?.name ?? "Product"}</p>
                      <p className="text-xs text-ink/50 mt-0.5">
                        Invested {formatBDT(inv.amount)} · {inv.profit_percent}% profit / {inv.loss_percent}% loss share
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                      inv.status === "active" ? "bg-gold-100 text-gold-600" :
                      inv.status === "withdrawal_requested" ? "bg-amber-100 text-amber-700" :
                      "bg-ink/5 text-ink/50"
                    }`}>
                      {inv.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-ink/50 mb-1">
                      <span>Stock sold</span>
                      <span>{soldPct.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-cream overflow-hidden">
                      <div className="h-full bg-gold" style={{ width: `${soldPct}%` }} />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className={`flex items-center gap-1 text-sm font-medium ${pl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {pl >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {pl >= 0 ? "+" : ""}{formatBDT(pl)} so far
                    </p>
                    {inv.status === "active" && (
                      <WithdrawButton investmentId={inv.id} eligible={eligible} soldPct={soldPct} maxAmount={inv.amount + Math.max(pl, 0)} />
                    )}
                    {inv.status === "withdrawal_requested" && (
                      <span className="text-xs text-amber-700">Withdrawal request pending admin review</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {recentOrders.length > 0 && (
        <section>
          <h2 className="font-display font-bold text-ink mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-gold-600" /> Recent Orders for Your Products
          </h2>
          <div className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream text-left text-xs text-ink/50 spec-readout">
                <tr>
                  <th className="px-4 py-2.5">Order</th>
                  <th className="px-4 py-2.5">Product</th>
                  <th className="px-4 py-2.5">Qty</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((row) => (
                  <tr key={row.id} className="border-t border-ink/5">
                    <td className="px-4 py-2.5 text-ink/70">{row.orders?.order_number}</td>
                    <td className="px-4 py-2.5 text-ink">{row.products?.name}</td>
                    <td className="px-4 py-2.5 text-ink/70">{row.quantity}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={row.orders?.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display font-bold text-ink mb-3 flex items-center gap-2">
          <Bell className="h-4 w-4 text-gold-600" /> Notifications
        </h2>
        <div className="space-y-2">
          {notifications.length === 0 && <p className="text-sm text-ink/40">No notifications yet.</p>}
          {notifications.map((n) => (
            <div key={n.id} className={`rounded-xl border p-3 text-sm ${n.is_read ? "border-ink/10 bg-white" : "border-gold bg-gold-100"}`}>
              <p className="font-medium text-ink">{n.title}</p>
              {n.body && <p className="text-ink/60 text-xs mt-0.5">{n.body}</p>}
            </div>
          ))}
        </div>
      </section>

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
    </div>
  );
}
