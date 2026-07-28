import { createClient } from "@/lib/supabase/server";
import StockAdjustRow from "./StockAdjustRow";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const supabase = await createClient();

  const results = await Promise.all([
    supabase.from("products").select("id, name, sku, current_stock, low_stock_threshold").order("current_stock"),
    supabase
      .from("stock_history")
      .select("id, change_type, quantity_change, stock_after, note, created_at, products(name)")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);
  const products = (results[0].data ?? []) as any[];
  const history = (results[1].data ?? []) as any[];

  return (
    <div className="space-y-6">
      <div>
        <p className="spec-readout text-xs text-gold-600">Stock</p>
        <h1 className="font-display font-bold text-2xl text-ink">Inventory</h1>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left text-xs text-ink/50 spec-readout">
            <tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Adjust</th></tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => (
              <StockAdjustRow key={p.id} product={p} />
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="font-display font-bold text-ink mb-3">Recent Stock Movements</h2>
        <div className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream text-left text-xs text-ink/50 spec-readout">
              <tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Change</th><th className="px-4 py-3">Stock After</th><th className="px-4 py-3">Date</th></tr>
            </thead>
            <tbody>
              {(history ?? []).map((h: any) => (
                <tr key={h.id} className="border-t border-ink/5">
                  <td className="px-4 py-3">{h.products?.name}</td>
                  <td className="px-4 py-3 capitalize text-ink/60">{h.change_type.replace(/_/g, " ")}</td>
                  <td className={`px-4 py-3 font-medium ${h.quantity_change < 0 ? "text-red-600" : "text-green-700"}`}>
                    {h.quantity_change > 0 ? "+" : ""}{h.quantity_change}
                  </td>
                  <td className="px-4 py-3">{h.stock_after}</td>
                  <td className="px-4 py-3 text-ink/40">{new Date(h.created_at).toLocaleString("en-GB")}</td>
                </tr>
              ))}
              {(!history || history.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-ink/40">No stock movements yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
