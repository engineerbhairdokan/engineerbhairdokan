import "server-only";
import { createServiceClient } from "@/lib/supabase/serviceClient";
import { sendBrevoEmail } from "./brevo";
import { formatBDT } from "@/lib/pricing";

export async function notifyAdminsOfNewOrder(orderId: string) {
  const supabase = createServiceClient();

  const { data: order } = await supabase
    .from("orders")
    .select("order_number, customer_name, customer_phone, grand_total, order_source")
    .eq("id", orderId)
    .single();
  if (!order) return;

  const { data: admins } = await supabase
    .from("admin_users")
    .select("email, name")
    .eq("is_active", true)
    .not("email", "is", null);

  if (!admins || admins.length === 0) return;

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1B2433;">New Order Received 🛒</h2>
      <p style="color: #4b5563; line-height: 1.6;">
        <strong>${(order as any).order_number}</strong> from ${(order as any).customer_name} (${(order as any).customer_phone})
      </p>
      <p style="color: #1B2433; font-weight: bold; font-size: 16px;">${formatBDT((order as any).grand_total)}</p>
      <p style="color: #4b5563;">Source: ${(order as any).order_source}</p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Engineer Bhai'r Dokan — Admin Alert</p>
    </div>
  `;

  await Promise.all(
    admins.map((a: any) =>
      sendBrevoEmail({ to: a.email, toName: a.name, subject: `New Order — ${(order as any).order_number}`, html }).catch(
        (e) => console.error("Failed to notify admin", a.email, e)
      )
    )
  );
}

export async function notifyAdminsOfSampleClaim(claimId: string) {
  const supabase = createServiceClient();

  const { data: claim } = await supabase
    .from("investor_sample_claims")
    .select("delivery_method, delivery_charge, investors(name, phone), products(name)")
    .eq("id", claimId)
    .single();
  if (!claim) return;

  const { data: admins } = await supabase
    .from("admin_users")
    .select("email, name")
    .eq("is_active", true)
    .not("email", "is", null);

  if (!admins || admins.length === 0) return;

  const c = claim as any;
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1B2433;">Investor Sample Claim 🎁</h2>
      <p style="color: #4b5563; line-height: 1.6;">
        <strong>${c.investors?.name}</strong> (${c.investors?.phone}) claimed a free sample of <strong>${c.products?.name}</strong>.
      </p>
      <p style="color: #4b5563;">Method: ${c.delivery_method}${c.delivery_charge > 0 ? ` — ${formatBDT(c.delivery_charge)} delivery charge deducted from their balance` : " — no charge"}</p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Engineer Bhai'r Dokan — Admin Alert</p>
    </div>
  `;

  await Promise.all(
    admins.map((a: any) =>
      sendBrevoEmail({ to: a.email, toName: a.name, subject: `Investor Sample Claim — ${c.products?.name}`, html }).catch(
        (e) => console.error("Failed to notify admin", a.email, e)
      )
    )
  );
}
