import { getCurrentCustomer } from "@/lib/customer/auth";
import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";
import StatusBadge from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

export default async function OrderHistoryPage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, order_number, status, grand_total, created_at, order_items(product_name, quantity)")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false });
  const orders = (data ?? []) as any[];

  return (
    <div className="space-y-3">
      <p className="font-display font-bold text-lg text-ink">Order History</p>
      {orders.length === 0 && (
        <p className="text-sm text-ink/40 py-8 text-center">No orders yet.</p>
      )}
      {orders.map((o) => (
        <div key={o.id} className="rounded-2xl border border-ink/10 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="font-mono font-semibold text-sm text-ink">{o.order_number}</p>
            <StatusBadge status={o.status} />
          </div>
          <p className="text-xs text-ink/40 mt-1">{new Date(o.created_at).toLocaleDateString("en-GB")}</p>
          <p className="text-sm text-ink/70 mt-2">
            {(o.order_items ?? []).map((it: any) => `${it.product_name} ×${it.quantity}`).join(", ")}
          </p>
          <p className="font-display font-bold text-ink mt-2">{formatBDT(o.grand_total)}</p>
        </div>
      ))}
    </div>
  );
}
