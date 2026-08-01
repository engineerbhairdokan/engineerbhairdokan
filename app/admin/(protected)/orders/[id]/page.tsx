import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";
import StatusBadge from "@/components/admin/StatusBadge";
import OrderStatusControl from "./OrderStatusControl";
import CourierAssignForm from "./CourierAssignForm";
import InvoiceButton from "./InvoiceButton";
import ReturnChargeEditor from "./ReturnChargeEditor";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const results = await Promise.all([
    supabase.from("orders").select("*, couriers(name)").eq("id", id).single(),
    supabase.from("order_items").select("*").eq("order_id", id),
    supabase.from("order_status_history").select("status, note, created_at").eq("order_id", id).order("created_at"),
    supabase.from("couriers").select("id, name").eq("is_active", true),
    supabase.from("invoices").select("invoice_number, generated_at").eq("order_id", id).maybeSingle(),
  ]);

  const order: any = results[0].data;
  const items = (results[1].data ?? []) as any[];
  const history = (results[2].data ?? []) as any[];
  const couriers = (results[3].data ?? []) as any[];
  const invoice: any = results[4].data;

  if (!order) notFound();

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="spec-readout text-xs text-gold-600">Order</p>
          <h1 className="font-display font-bold text-2xl text-ink flex items-center gap-3">
            {order.order_number} <StatusBadge status={order.status} />
          </h1>
        </div>
        <div className="flex gap-2">
          <InvoiceButton orderId={id} existingInvoiceNumber={invoice?.invoice_number ?? null} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-ink/10 bg-white p-5 lg:col-span-2 space-y-4">
          <h2 className="font-display font-bold text-ink">Items</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-ink/40 spec-readout">
              <tr><th className="py-2">Product</th><th className="py-2">Qty</th><th className="py-2">Price</th><th className="py-2 text-right">Total</th></tr>
            </thead>
            <tbody>
              {(items ?? []).map((it) => (
                <tr key={it.id} className="border-t border-ink/5">
                  <td className="py-2">{it.product_name}</td>
                  <td className="py-2">{it.quantity}</td>
                  <td className="py-2">{formatBDT(it.unit_price)}</td>
                  <td className="py-2 text-right">{formatBDT(it.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-ink/10 pt-3 space-y-1 text-sm ml-auto max-w-xs">
            <Row label="Subtotal" value={formatBDT(order.subtotal)} />
            <Row label="Discount" value={`- ${formatBDT(order.discount_amount)}`} />
            <Row label="Delivery Charge" value={formatBDT(order.delivery_charge)} />
            <Row label="Grand Total" value={formatBDT(order.grand_total)} bold />
          </div>

          <div>
            <h2 className="font-display font-bold text-ink mb-2">Customer</h2>
            <p className="text-sm text-ink">{order.customer_name} — {order.customer_phone}</p>
            {order.customer_alt_phone && <p className="text-sm text-ink/60">Alt: {order.customer_alt_phone}</p>}
            <p className="text-sm text-ink/60 mt-1">{order.full_address}, {order.district}</p>
            {order.notes && <p className="text-sm text-ink/60 mt-2 italic">Note: {order.notes}</p>}
          </div>

          <div>
            <h2 className="font-display font-bold text-ink mb-2">Status History</h2>
            <ul className="space-y-1.5 text-sm">
              {(history ?? []).map((h, i) => (
                <li key={i} className="flex items-center gap-2 text-ink/60">
                  <StatusBadge status={h.status} />
                  <span>{new Date(h.created_at).toLocaleString("en-GB")}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-ink/10 bg-white p-5">
            <h2 className="font-display font-bold text-ink mb-3">Update Status</h2>
            <OrderStatusControl orderId={id} currentStatus={order.status} />
          </div>

          {order.status === "returned" && (
            <ReturnChargeEditor orderId={id} currentCharge={order.return_charge} />
          )}

          <div className="rounded-2xl border border-ink/10 bg-white p-5">
            <h2 className="font-display font-bold text-ink mb-3">Courier</h2>
            <CourierAssignForm
              orderId={id}
              couriers={couriers ?? []}
              currentCourierId={order.courier_id}
              currentTracking={order.tracking_number ?? ""}
            />
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white p-5 text-sm text-ink/60">
            <p><span className="text-ink/40">Source:</span> <span className="capitalize">{order.order_source.replace(/_/g, " ")}</span></p>
            <p><span className="text-ink/40">Placed:</span> {new Date(order.created_at).toLocaleString("en-GB")}</p>
          </div>
        </div>
      </div>

      <Link href="/admin/orders" className="inline-block text-sm text-ink/50 hover:text-ink">← Back to Orders</Link>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={bold ? "font-display font-bold text-ink" : "text-ink/50"}>{label}</span>
      <span className={bold ? "font-display font-bold text-ink" : "text-ink"}>{value}</span>
    </div>
  );
}
