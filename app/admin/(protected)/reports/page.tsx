import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";
import SalesChart from "@/components/admin/SalesChart";
import ExportCsvButton from "@/components/admin/ExportCsvButton";

export const dynamic = "force-dynamic";

function defaultRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const { start: qsStart, end: qsEnd } = await searchParams;
  const { start: defStart, end: defEnd } = defaultRange();
  const start = qsStart || defStart;
  const end = qsEnd || defEnd;

  const supabase = await createClient();

  const results = await Promise.all([
    supabase.rpc("report_profit_loss", { p_start: start, p_end: end }).single(),
    supabase.rpc("report_sales_by_day", { p_start: start, p_end: end }),
    supabase.rpc("report_orders_by_source", { p_start: start, p_end: end }),
    supabase.from("best_selling_products").select("*").limit(10),
    supabase.from("category_profit").select("*"),
  ]);

  const pl: any = results[0].data;
  const salesByDay = (results[1].data ?? []) as any[];
  const bySource = (results[2].data ?? []) as any[];
  const bestSellers = (results[3].data ?? []) as any[];
  const categoryProfit = (results[4].data ?? []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="spec-readout text-xs text-gold-600">Business Intelligence</p>
          <h1 className="font-display font-bold text-2xl text-ink">Reports</h1>
        </div>
        <form action="/admin/reports" className="flex items-end gap-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink/60">From</span>
            <input type="date" name="start" defaultValue={start} className="rounded-xl border border-ink/15 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink/60">To</span>
            <input type="date" name="end" defaultValue={end} className="rounded-xl border border-ink/15 px-3 py-2 text-sm" />
          </label>
          <button className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-cream hover:bg-ink-700">Apply</button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat label="Total Revenue" value={formatBDT(pl?.total_revenue ?? 0)} />
        <Stat label="Product Cost" value={formatBDT(pl?.total_product_cost ?? 0)} />
        <Stat label="Delivery Cost" value={formatBDT(pl?.total_delivery_cost ?? 0)} />
        <Stat label="Gross Profit" value={formatBDT(pl?.gross_profit ?? 0)} highlight />
        <Stat label="Expenses" value={formatBDT(pl?.total_expenses ?? 0)} />
        <Stat label="Return/Courier Losses" value={formatBDT(pl?.total_return_losses ?? 0)} negative />
        <Stat label="Net Profit" value={formatBDT(pl?.net_profit ?? 0)} highlight negative={(pl?.net_profit ?? 0) < 0} />
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-bold text-ink">Sales by Day</h2>
          <ExportCsvButton filename={`sales_${start}_to_${end}.csv`} rows={salesByDay ?? []} />
        </div>
        <SalesChart data={salesByDay ?? []} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink/10 bg-white p-5">
          <h2 className="font-display font-bold text-ink mb-3">Orders by Source</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-ink/40 spec-readout">
              <tr><th className="py-1.5">Source</th><th className="py-1.5">Orders</th><th className="py-1.5 text-right">Revenue</th></tr>
            </thead>
            <tbody>
              {(bySource ?? []).map((s: any) => (
                <tr key={s.order_source} className="border-t border-ink/5">
                  <td className="py-1.5 capitalize">{s.order_source.replace(/_/g, " ")}</td>
                  <td className="py-1.5">{s.orders_count}</td>
                  <td className="py-1.5 text-right">{formatBDT(s.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-5">
          <h2 className="font-display font-bold text-ink mb-3">Category-wise Profit</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-ink/40 spec-readout">
              <tr><th className="py-1.5">Category</th><th className="py-1.5">Revenue</th><th className="py-1.5 text-right">Profit</th></tr>
            </thead>
            <tbody>
              {(categoryProfit ?? []).map((c: any) => (
                <tr key={c.category_id} className="border-t border-ink/5">
                  <td className="py-1.5">{c.category_name}</td>
                  <td className="py-1.5">{formatBDT(c.revenue)}</td>
                  <td className="py-1.5 text-right text-gold-600 font-medium">{formatBDT(c.gross_profit)}</td>
                </tr>
              ))}
              {(!categoryProfit || categoryProfit.length === 0) && <tr><td colSpan={3} className="py-6 text-center text-ink/40">No data yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-ink">Best Selling Products (All-Time)</h2>
          <ExportCsvButton filename="best_sellers.csv" rows={bestSellers ?? []} />
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-ink/40 spec-readout">
            <tr><th className="py-1.5">Product</th><th className="py-1.5">Units Sold</th><th className="py-1.5">Revenue</th><th className="py-1.5 text-right">Profit</th></tr>
          </thead>
          <tbody>
            {(bestSellers ?? []).map((p: any) => (
              <tr key={p.product_id} className="border-t border-ink/5">
                <td className="py-1.5">{p.name}</td>
                <td className="py-1.5">{p.units_sold}</td>
                <td className="py-1.5">{formatBDT(p.total_revenue)}</td>
                <td className="py-1.5 text-right text-gold-600 font-medium">{formatBDT(p.total_gross_profit)}</td>
              </tr>
            ))}
            {(!bestSellers || bestSellers.length === 0) && <tr><td colSpan={4} className="py-6 text-center text-ink/40">No sales yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight, negative }: { label: string; value: string; highlight?: boolean; negative?: boolean }) {
  const color = negative ? "text-red-600" : highlight ? "text-gold-600" : "text-ink";
  return (
    <div className="rounded-2xl bg-white border border-ink/10 p-4">
      <p className="spec-readout text-[10px] text-ink/40">{label}</p>
      <p className={`font-display font-bold text-lg ${color}`}>{value}</p>
    </div>
  );
}
