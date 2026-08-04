import "server-only";
import { createClient } from "@/lib/supabase/server";
import { sendBrevoEmail } from "./brevo";
import { formatBDT } from "@/lib/pricing";

const STATUS_COPY: Record<string, { subject: string; heading: string; body: string }> = {
  confirmed: {
    subject: "Your Order Has Been Confirmed",
    heading: "Order Confirmed ✅",
    body: "We've confirmed your order and it's now being prepared.",
  },
  handed_to_courier: {
    subject: "Your Order Is On Its Way",
    heading: "Handed to Courier 🚚",
    body: "Your order has been handed over to our courier partner and is on its way to you.",
  },
  delivered: {
    subject: "Your Order Has Been Delivered",
    heading: "Delivered 🎉",
    body: "Your order has been delivered. Thanks for shopping with us!",
  },
};

export async function sendOrderStatusEmailToCustomer(orderId: string, status: string) {
  const copy = STATUS_COPY[status];
  if (!copy) return;

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("order_number, grand_total, tracking_number, couriers(name), customers(name, email)")
    .eq("id", orderId)
    .single();

  const email = (order as any)?.customers?.email;
  if (!order || !email) return;

  const name = (order as any).customers?.name ?? "there";
  const courierLine = (order as any).couriers?.name
    ? `<p style="color:#4b5563;">Courier: ${(order as any).couriers.name}${(order as any).tracking_number ? ` — Tracking: ${(order as any).tracking_number}` : ""}</p>`
    : "";

  await sendBrevoEmail({
    to: email,
    toName: name,
    subject: `${copy.subject} — ${(order as any).order_number}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1B2433;">${copy.heading}</h2>
        <p style="color: #4b5563; line-height: 1.6;">Hi ${name}, ${copy.body}</p>
        <p style="color: #1B2433; font-weight: bold;">Order ${(order as any).order_number} — ${formatBDT((order as any).grand_total)}</p>
        ${courierLine}
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Engineer Bhai'r Dokan</p>
      </div>
    `,
  }).catch((e) => console.error("Failed to send order status email", e));
}
