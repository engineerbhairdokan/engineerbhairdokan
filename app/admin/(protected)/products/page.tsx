import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";
import { Plus } from "lucide-react";
import DeleteProductButton from "./DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, sku, name, status, regular_price, current_stock, low_stock_threshold, total_cost")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="spec-readout text-xs text-gold-600">Catalog</p>
          <h1 className="font-display font-bold text-2xl text-ink">Products</h1>
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-cream hover:bg-ink-700">
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left text-xs text-ink/50 spec-readout">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => (
              <tr key={p.id} className="border-t border-ink/5 hover:bg-cream/50">
                <td className="px-4 py-3 font-medium text-ink">{p.name}</td>
                <td className="px-4 py-3 text-ink/50 font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs capitalize">{p.status}</span>
                </td>
                <td className="px-4 py-3">{formatBDT(p.regular_price)}</td>
                <td className="px-4 py-3 text-ink/50">{formatBDT(p.total_cost)}</td>
                <td className="px-4 py-3">
                  <span className={p.current_stock <= p.low_stock_threshold ? "font-medium text-red-600" : "text-ink"}>
                    {p.current_stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link href={`/admin/products/${p.id}/edit`} className="text-gold-600 hover:underline mr-3">Edit</Link>
                  <DeleteProductButton id={p.id} name={p.name} />
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-ink/40">No products yet — add your first one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
