import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";
import Link from "next/link";
import { AlertTriangle, TrendingUp, Package, ShoppingBag } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const supabase = await createClient();

  const [todayResult, plResult, stockResult, recentOrdersResult, lowStockResult] = await Promise.all([
    supabase.from("dashboard_today").select("*").single(),
    supabase.from("profit_loss_summary").select("*").single(),
    supabase.from("stock_value_summary").select("*").single(),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, status, order_source, grand_total, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("products")
      .select("id, name, current_stock, low_stock_threshold")
      .lte("current_stock", 9999)
      .order("current_stock", { ascending: true })
      .limit(6),
  ]);

  const today: any = todayResult.data;
  const pl: any = plResult.data;
  const stock: any = stockResult.data;
  const recentOrders = (recentOrdersResult.data ?? []) as any[];
  const lowStockAll = (lowStockResult.data ?? []) as any[];

  return {
    today,
    pl,
    stock,
    recentOrders,
    lowStock: lowStockAll.filter((p) => p.current_stock <= p.low_stock_threshold),
  };
}

export default async function AdminDashboardPage() {
  const { today, pl, stock, recentOrders, lowStock } = await getDashboardData();

  const stats = [
    { label: "Today's Orders", value: today?.todays_orders ?? 0, icon: ShoppingBag },
    { label: "Pending Orders", value: today?.pending_orders ?? 0, icon: Package },
    { label: "Today's Revenue", value: formatBDT(today?.todays_revenue ?? 0), icon: TrendingUp },
    { label: "Delivered Today", value: today?.delivered_today ?? 0, icon: ShoppingBag },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="spec-readout text-xs text-gold-600">Overview</p>
        <h1 className="font-display font-bold text-2xl text-ink">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl bg-white border border-ink/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="spec-readout text-[10px] text-ink/40">{label}</span>
              <Icon className="h-4 w-4 text-gold-600" />
            </div>
            <p className="font-display font-bold text-xl text-ink">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white border border-ink/10 p-5 lg:col-span-2">
          <h2 className="font-display font-bold text-ink mb-4">Profit & Loss (All-Time)</h2>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <Stat label="Total Revenue" value={formatBDT(pl?.total_revenue ?? 0)} />
            <Stat label="Product Cost" value={formatBDT(pl?.total_product_cost ?? 0)} />
            <Stat label="Delivery Cost" value={formatBDT(pl?.total_delivery_cost ?? 0)} />
            <Stat label="Gross Profit" value={formatBDT(pl?.gross_profit ?? 0)} highlight />
            <Stat label="Total Expenses" value={formatBDT(pl?.total_expenses ?? 0)} />
            <Stat label="Return/Courier Losses" value={formatBDT(pl?.total_return_losses ?? 0)} negative />
            <Stat
              label="Net Profit"
              value={formatBDT(pl?.net_profit ?? 0)}
              highlight
              negative={(pl?.net_profit ?? 0) < 0}
            />
          </div>
          <Link href="/admin/reports" className="mt-4 inline-block text-sm text-gold-600 hover:underline">
            View full reports →
          </Link>
        </div>

        <div className="rounded-2xl bg-white border border-ink/10 p-5">
          <h2 className="font-display font-bold text-ink mb-4">Stock Value</h2>
          <Stat label="At Cost" value={formatBDT(stock?.total_stock_value_at_cost ?? 0)} />
          <div className="h-3" />
          <Stat label="At Retail" value={formatBDT(stock?.total_stock_value_at_retail ?? 0)} />
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-ink/50">Low Stock</span>
            <span className="font-medium text-ink">{stock?.low_stock_count ?? 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink/50">Out of Stock</span>
            <span className="font-medium text-red-600">{stock?.out_of_stock_count ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white border border-ink/10 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-ink">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-gold-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {recentOrders.length === 0 && <p className="text-sm text-ink/40">No orders yet.</p>}
            {recentOrders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-cream text-sm"
              >
                <div>
                  <p className="font-medium text-ink">{o.order_number}</p>
                  <p className="text-ink/40 text-xs">{o.customer_name} · {o.order_source}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-ink">{formatBDT(o.grand_total)}</p>
                  <StatusBadge status={o.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-ink/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-gold-600" />
            <h2 className="font-display font-bold text-ink">Low Stock</h2>
          </div>
          <div className="space-y-2">
            {lowStock.length === 0 && <p className="text-sm text-ink/40">All stock levels healthy.</p>}
            {lowStock.map((p) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span className="text-ink">{p.name}</span>
                <span className={p.current_stock === 0 ? "font-medium text-red-600" : "font-medium text-gold-600"}>
                  {p.current_stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight, negative }: { label: string; value: string; highlight?: boolean; negative?: boolean }) {
  const color = negative ? "text-red-600" : highlight ? "text-gold-600" : "text-ink";
  return (
    <div>
      <p className="spec-readout text-[10px] text-ink/40">{label}</p>
      <p className={`font-display font-bold ${color}`}>{value}</p>
    </div>
  );
}
