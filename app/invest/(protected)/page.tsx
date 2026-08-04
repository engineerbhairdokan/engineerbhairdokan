import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";
import StatusBadge from "@/components/admin/StatusBadge";
import WithdrawButton from "./WithdrawButton";
import { Package, TrendingUp, TrendingDown, ShoppingBag, Truck, CheckCircle2, RotateCcw } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_GROUPS: Record<string, string[]> = {
  Processing: ["pending", "confirmed", "processing", "packed"],
  Shipped: ["handed_to_courier", "in_transit"],
  Delivered: ["delivered"],
  "Returned/Cancelled": ["returned", "cancelled"],
};
const ALL_STATUSES = ["pending","confirmed","processing","packed","handed_to_courier","in_transit","delivered","returned","cancelled"];

export default async function InvestorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusFilter } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: investorRow } = await supabase.from("investors").select("id").eq("auth_user_id", user!.id).single();
  const investorId = (investorRow as any)?.id;

  const [investmentsResult] = await Promise.all([
    supabase
      .from("product_investments")
      .select("id, product_id, amount, profit_percent, loss_percent, stock_at_investment, status, invested_at, products(name, current_stock, total_cost, regular_price, low_stock_threshold)")
      .eq("investor_id", investorId)
      .order("invested_at", { ascending: false }),
  ]);

  const investments = (investmentsResult.data ?? []) as any[];

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

  // ALL orders touching invested products (no cap) — admin-style visibility
  const productIds = [...new Set(investments.map((i) => i.product_id))];

  // Stock value scoped to only the investor's own invested products
  const uniqueProducts = new Map<string, any>();
  for (const inv of investments) {
    if (inv.product_id && inv.products && !uniqueProducts.has(inv.product_id)) {
      uniqueProducts.set(inv.product_id, inv.products);
    }
  }
  let stockAtCost = 0;
  let stockAtRetail = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  for (const p of uniqueProducts.values()) {
    const stock = p.current_stock ?? 0;
    stockAtCost += stock * (Number(p.total_cost) || 0);
    stockAtRetail += stock * (Number(p.regular_price) || 0);
    if (stock === 0) outOfStockCount += 1;
    else if (stock <= (p.low_stock_threshold ?? 0)) lowStockCount += 1;
  }
  let allOrderRows: any[] = [];
  if (productIds.length > 0) {
    let q = supabase
      .from("order_items")
      .select("id, quantity, line_total, product_id, products(name), orders(order_number, status, created_at)")
      .in("product_id", productIds)
      .order("id", { ascending: false });
    const { data } = await q;
    allOrderRows = data ?? [];
  }
  if (statusFilter) {
    allOrderRows = allOrderRows.filter((r) => r.orders?.status === statusFilter);
  }

  const statusCounts: Record<string, number> = {};
  for (const s of ALL_STATUSES) statusCounts[s] = 0;
  let totalRevenue = 0;
  let unfilteredRows: any[] = [];
  if (productIds.length > 0) {
    const { data } = await supabase
      .from("order_items")
      .select("id, line_total, orders(status)")
      .in("product_id", productIds);
    unfilteredRows = data ?? [];
  }
  for (const row of unfilteredRows) {
    const s = row.orders?.status;
    if (s) statusCounts[s] = (statusCounts[s] ?? 0) + 1;
    if (s === "delivered") totalRevenue += Number(row.line_total) || 0;
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

                  <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                    <p className={`flex items-center gap-1 text-sm font-medium ${pl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {pl >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {pl >= 0 ? "+" : ""}{formatBDT(pl)} so far
                    </p>
                    <div className="flex items-center gap-2">
                      {inv.status === "active" && (
                        <Link href={`/invest/sample-order?investment=${inv.id}`} className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink hover:bg-cream">
                          Order Sample
                        </Link>
                      )}
                      {inv.status === "active" && (
                        <WithdrawButton investmentId={inv.id} eligible={eligible} soldPct={soldPct} maxAmount={inv.amount + Math.max(pl, 0)} />
                      )}
                      {inv.status === "withdrawal_requested" && (
                        <span className="text-xs text-amber-700">Withdrawal request pending admin review</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {productIds.length > 0 && (
        <div className="rounded-2xl bg-white border border-ink/10 p-5 max-w-sm">
          <h2 className="font-display font-bold text-ink mb-4">Stock Value</h2>
          <InvestorStat label="At Cost" value={formatBDT(stockAtCost)} />
          <div className="h-3" />
          <InvestorStat label="At Retail" value={formatBDT(stockAtRetail)} />
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-ink/50">Low Stock</span>
            <span className="font-medium text-ink">{lowStockCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink/50">Out of Stock</span>
            <span className="font-medium text-red-600">{outOfStockCount}</span>
          </div>
        </div>
      )}

      {productIds.length > 0 && (
        <section>
          <h2 className="font-display font-bold text-ink mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-gold-600" /> Orders for Your Products
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 mb-4">
            <StatCard icon={ShoppingBag} label="Processing" value={STATUS_GROUPS.Processing.reduce((s, k) => s + statusCounts[k], 0)} />
            <StatCard icon={Truck} label="Shipped" value={STATUS_GROUPS.Shipped.reduce((s, k) => s + statusCounts[k], 0)} />
            <StatCard icon={CheckCircle2} label="Delivered" value={statusCounts.delivered} highlight />
            <StatCard icon={RotateCcw} label="Returned/Cancelled" value={statusCounts.returned + statusCounts.cancelled} />
            <div className="rounded-2xl border border-ink/10 bg-white p-4 col-span-2 sm:col-span-1">
              <p className="spec-readout text-[10px] text-ink/40">Delivered Revenue</p>
              <p className="font-display font-bold text-xl text-ink mt-1">{formatBDT(totalRevenue)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream text-left text-xs text-ink/50 spec-readout">
                <tr>
                  <th className="px-4 py-2.5">Order</th>
                  <th className="px-4 py-2.5">Product</th>
                  <th className="px-4 py-2.5">Qty</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Date</th>
                </tr>
              </thead>
              <tbody>
                {allOrderRows.map((row) => (
                  <tr key={row.id} className="border-t border-ink/5">
                    <td className="px-4 py-2.5 text-ink/70">{row.orders?.order_number}</td>
                    <td className="px-4 py-2.5 text-ink">{row.products?.name}</td>
                    <td className="px-4 py-2.5 text-ink/70">{row.quantity}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={row.orders?.status} /></td>
                    <td className="px-4 py-2.5 text-ink/40">{row.orders?.created_at ? new Date(row.orders.created_at).toLocaleDateString("en-GB") : "—"}</td>
                  </tr>
                ))}
                {allOrderRows.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-ink/40">No orders match this filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

    </div>
  );
}

function StatCard({ icon: Icon, label, value, highlight }: { icon: any; label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? "border-emerald-300 bg-emerald-50" : "border-ink/10 bg-white"}`}>
      <div className="flex items-center gap-1.5 text-ink/40">
        <Icon className="h-3.5 w-3.5" />
        <p className="spec-readout text-[10px]">{label}</p>
      </div>
      <p className="font-display font-bold text-xl text-ink mt-1">{value}</p>
    </div>
  );
}

function InvestorStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="spec-readout text-[10px] text-ink/40">{label}</p>
      <p className="font-display font-bold text-ink">{value}</p>
    </div>
  );
}
