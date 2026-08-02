import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendBrevoEmail } from "@/lib/email/brevo";
import { formatBDT } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ ok: false }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    // RLS ensures this only returns the order if it belongs to the logged-in customer
    const { data: order } = await supabase
      .from("orders")
      .select("order_number, grand_total, delivery_method, district, full_address, customer_id, customers(name, email)")
      .eq("id", orderId)
      .single();

    if (!order) return NextResponse.json({ ok: false }, { status: 404 });

    const email = (order as any).customers?.email;
    const name = (order as any).customers?.name ?? "there";
    if (!email) return NextResponse.json({ ok: true, skipped: "no email on file" });

    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, quantity, unit_price")
      .eq("order_id", orderId);

    const itemsHtml = (items ?? [])
      .map((i: any) => `<li>${i.product_name} × ${i.quantity} — ${formatBDT(i.unit_price * i.quantity)}</li>`)
      .join("");

    await sendBrevoEmail({
      to: email,
      toName: name,
      subject: `Order Confirmed — ${(order as any).order_number}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1B2433;">Thanks for your order, ${name}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Your order <strong>${(order as any).order_number}</strong> has been received and is being processed.
          </p>
          <ul style="color: #4b5563; line-height: 1.8;">${itemsHtml}</ul>
          <p style="color: #1B2433; font-weight: bold; font-size: 16px;">
            Total: ${formatBDT((order as any).grand_total)} (Cash on Delivery)
          </p>
          ${
            (order as any).delivery_method === "pickup"
              ? `<p style="color: #4b5563;">You'll be notified once it's ready for pickup.</p>`
              : `<p style="color: #4b5563;">Delivering to: ${(order as any).full_address}, ${(order as any).district}</p>`
          }
          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Engineer Bhai'r Dokan</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to send order confirmation email", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
