import { getCurrentCustomer } from "@/lib/customer/auth";
import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";
import StatusBadge from "@/components/admin/StatusBadge";
import { Coins, FileText } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TERMINAL_NO_POINTS = ["cancelled", "returned"];

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
      {orders.map((o) => {
        const points = Math.floor(Number(o.grand_total) / 100);
        const isDelivered = o.status === "delivered";
        const showPoints = points > 0 && !TERMINAL_NO_POINTS.includes(o.status);
        return (
          <div key={o.id} className="rounded-2xl border border-ink/10 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono font-semibold text-sm text-ink">{o.order_number}</p>
              <StatusBadge status={o.status} />
            </div>
            <p className="text-xs text-ink/40 mt-1">{new Date(o.created_at).toLocaleDateString("en-GB")}</p>
            <p className="text-sm text-ink/70 mt-2">
              {(o.order_items ?? []).map((it: any) => `${it.product_name} ×${it.quantity}`).join(", ")}
            </p>
            <div className="flex items-center justify-between mt-2">
              <p className="font-display font-bold text-ink">{formatBDT(o.grand_total)}</p>
              {showPoints && (
                <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  isDelivered ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}>
                  <Coins className="h-3 w-3" />
                  {isDelivered ? `+${points} pts earned` : `+${points} pts pending`}
                </span>
              )}
            </div>
            <Link
              href={`/account/orders/${o.id}/invoice`}
              target="_blank"
              className="mt-3 flex items-center justify-center gap-1.5 rounded-full border border-ink/15 py-2 text-xs font-medium text-ink hover:bg-cream"
            >
              <FileText className="h-3.5 w-3.5" /> View Invoice
            </Link>
          </div>
        );
      })}
    </div>
  );
}
