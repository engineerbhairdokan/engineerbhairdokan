import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";
import PrintButton from "./PrintButton";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: items }, { data: invoice }, { data: contact }] = await Promise.all([
    supabase.from("orders").select("*, couriers(name, merchant_code)").eq("id", id).single(),
    supabase.from("order_items").select("*").eq("order_id", id),
    supabase.from("invoices").select("*").eq("order_id", id).single(),
    supabase.from("contact_information").select("*").eq("id", 1).single(),
  ]);

  if (!order || !invoice) notFound();

  return (
    <div className="mx-auto max-w-2xl bg-white p-10 print:p-0 text-ink">
      <div className="mb-6 print:hidden flex justify-end">
        <PrintButton />
      </div>

      <div className="flex items-start justify-between border-b border-ink/10 pb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">{contact?.business_name ?? "Engineer Bhai'r Dokan"}</h1>
          {contact?.address && <p className="text-sm text-ink/60 mt-1">{contact.address}</p>}
          {contact?.phone && <p className="text-sm text-ink/60">{contact.phone}</p>}
        </div>
        <div className="text-right">
          <p className="font-display font-bold text-lg">INVOICE</p>
          <p className="text-sm text-ink/60">{invoice.invoice_number}</p>
          <p className="text-xs text-ink/40">{new Date(invoice.generated_at).toLocaleDateString("en-GB")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 py-6 text-sm">
        <div>
          <p className="spec-readout text-[10px] text-ink/40 mb-1">Bill To</p>
          <p className="font-medium">{order.customer_name}</p>
          <p className="text-ink/60">{order.customer_phone}</p>
          <p className="text-ink/60">{order.full_address}, {order.district}</p>
        </div>
        <div className="text-right">
          <p className="spec-readout text-[10px] text-ink/40 mb-1">Order</p>
          <p className="font-medium">{order.order_number}</p>
          {order.couriers?.name && <p className="text-ink/60">Courier: {order.couriers.name}</p>}
          {order.couriers?.merchant_code && <p className="text-ink/60">Merchant Code: {order.couriers.merchant_code}</p>}
          {order.tracking_number && <p className="text-ink/60">Tracking: {order.tracking_number}</p>}
        </div>
      </div>

      <table className="w-full text-sm border-t border-ink/10">
        <thead>
          <tr className="text-left spec-readout text-[10px] text-ink/40">
            <th className="py-2">Item</th><th className="py-2">Qty</th><th className="py-2">Price</th><th className="py-2 text-right">Total</th>
          </tr>
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

      <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
        <div className="flex justify-between"><span className="text-ink/50">Subtotal</span><span>{formatBDT(order.subtotal)}</span></div>
        <div className="flex justify-between"><span className="text-ink/50">Discount</span><span>- {formatBDT(order.discount_amount)}</span></div>
        <div className="flex justify-between"><span className="text-ink/50">Delivery Charge</span><span>{formatBDT(order.delivery_charge)}</span></div>
        <div className="flex justify-between border-t border-ink/10 pt-1.5 font-display font-bold">
          <span>Grand Total</span><span>{formatBDT(order.grand_total)}</span>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-ink/40 spec-readout">Payment Method: Cash on Delivery</p>
    </div>
  );
}
