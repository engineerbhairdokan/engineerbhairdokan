import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";
import PrintButton from "./PrintButton";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const results = await Promise.all([
    supabase.from("orders").select("*, couriers(name, merchant_code)").eq("id", id).single(),
    supabase.from("order_items").select("*").eq("order_id", id),
    supabase.from("invoices").select("*").eq("order_id", id).single(),
    supabase.from("contact_information").select("*").eq("id", 1).single(),
  ]);

  const order: any = results[0].data;
  const items = (results[1].data ?? []) as any[];
  const invoice: any = results[2].data;
  const contact: any = results[3].data;

  if (!order || !invoice) notFound();

  return (
    <div className="flex justify-center bg-ink/5 py-8 print:bg-white print:py-0">
      <div className="mb-6 print:hidden fixed top-4 right-4">
        <PrintButton />
      </div>

      {/* 80mm thermal receipt */}
      <div className="receipt bg-white text-ink px-3 py-4 font-mono text-[11px] leading-snug">
        <div className="text-center">
          <p className="font-bold text-sm">{contact?.business_name ?? "Engineer Bhai'r Dokan"}</p>
          {contact?.address && <p>{contact.address}</p>}
          {contact?.phone && <p>{contact.phone}</p>}
        </div>

        <div className="dashed my-2" />

        <div>
          <Row label="Invoice#" value={invoice.invoice_number} />
          <Row label="Order#" value={order.order_number} />
          <Row label="Date" value={new Date(invoice.generated_at).toLocaleDateString("en-GB")} />
        </div>

        <div className="dashed my-2" />

        <div>
          <p className="font-bold">BILL TO</p>
          <p>{order.customer_name}</p>
          <p>{order.customer_phone}</p>
          {order.delivery_method === "pickup" ? (
            <p>Pickup order</p>
          ) : (
            <p className="whitespace-pre-wrap">{order.full_address}, {order.district}</p>
          )}
        </div>

        <div className="dashed my-2" />

        {order.couriers?.name && <Row label="Courier" value={order.couriers.name} />}
        {order.couriers?.merchant_code && <Row label="Merchant" value={order.couriers.merchant_code} />}
        {order.tracking_number && <Row label="Tracking" value={order.tracking_number} />}
        {(order.couriers?.name || order.tracking_number) && <div className="dashed my-2" />}

        <div>
          {items.map((it) => (
            <div key={it.id} className="mb-1">
              <p className="truncate">{it.product_name}</p>
              <div className="flex justify-between">
                <span>{it.quantity} x {formatBDT(it.unit_price)}</span>
                <span>{formatBDT(it.line_total)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="dashed my-2" />

        <Row label="Subtotal" value={formatBDT(order.subtotal)} />
        {order.discount_amount > 0 && <Row label="Discount" value={`- ${formatBDT(order.discount_amount)}`} />}
        <Row label="Delivery" value={formatBDT(order.delivery_charge)} />

        <div className="dashed my-2" />

        <div className="flex justify-between font-bold text-sm">
          <span>TOTAL</span>
          <span>{formatBDT(order.grand_total)}</span>
        </div>

        <div className="dashed my-2" />

        <p className="text-center font-bold">CASH ON DELIVERY</p>
        <p className="text-center mt-2">Thank you for shopping with us!</p>
        <p className="text-center">Engineer Approved, Customer Loved</p>
      </div>

      <style>{`
        .receipt { width: 80mm; }
        .dashed { border-top: 1px dashed #999; }
        @media print {
          @page { size: 80mm auto; margin: 0; }
          body { margin: 0; }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
