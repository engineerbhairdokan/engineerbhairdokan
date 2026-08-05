import { notFound } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { createClient } from "@/lib/supabase/server";
import { formatBDT } from "@/lib/pricing";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function CustomerInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCurrentCustomer();
  if (!customer) notFound();

  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, couriers(name, merchant_code)")
    .eq("id", id)
    .eq("customer_id", customer.id)
    .single();

  if (!order) notFound();

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id);
  const { data: contact } = await supabase.from("contact_information").select("*").eq("id", 1).single();

  // Auto-generate the invoice on first view if an admin hasn't already created one.
  let { data: invoice } = await supabase.from("invoices").select("*").eq("order_id", id).maybeSingle();
  if (!invoice) {
    const { data: created } = await supabase.from("invoices").insert({ order_id: id }).select("*").single();
    invoice = created;
  }

  const o: any = order;
  const orderItems = (items ?? []) as any[];
  const c: any = contact;

  return (
    <div className="flex justify-center bg-ink/5 py-8 print:bg-white print:py-0">
      <div className="mb-6 print:hidden fixed top-4 right-4">
        <PrintButton />
      </div>

      {/* 80mm thermal receipt */}
      <div className="receipt bg-white text-ink px-3 py-4 font-mono text-[11px] leading-snug">
        <div className="text-center">
          <p className="font-bold text-sm">{c?.business_name ?? "Engineer Bhai'r Dokan"}</p>
          {c?.address && <p>{c.address}</p>}
          {c?.phone && <p>{c.phone}</p>}
        </div>

        <div className="dashed my-2" />

        <div>
          <Row label="Invoice#" value={invoice?.invoice_number ?? o.order_number} />
          <Row label="Order#" value={o.order_number} />
          <Row label="Date" value={new Date(invoice?.generated_at ?? o.created_at).toLocaleDateString("en-GB")} />
        </div>

        <div className="dashed my-2" />

        <div>
          <p className="font-bold">BILL TO</p>
          <p>{o.customer_name}</p>
          <p>{o.customer_phone}</p>
          {o.delivery_method === "pickup" ? (
            <p>Pickup order</p>
          ) : (
            <p className="whitespace-pre-wrap">{o.full_address}, {o.district}</p>
          )}
        </div>

        <div className="dashed my-2" />

        {o.couriers?.name && <Row label="Courier" value={o.couriers.name} />}
        {o.tracking_number && <Row label="Tracking" value={o.tracking_number} />}
        {(o.couriers?.name || o.tracking_number) && <div className="dashed my-2" />}

        <div>
          {orderItems.map((it) => (
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

        <Row label="Subtotal" value={formatBDT(o.subtotal)} />
        {o.discount_amount > 0 && <Row label="Discount" value={`- ${formatBDT(o.discount_amount)}`} />}
        <Row label="Delivery" value={formatBDT(o.delivery_charge)} />

        <div className="dashed my-2" />

        <div className="flex justify-between font-bold text-sm">
          <span>TOTAL</span>
          <span>{formatBDT(o.grand_total)}</span>
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
