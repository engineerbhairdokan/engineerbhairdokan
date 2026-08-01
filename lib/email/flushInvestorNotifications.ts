import "server-only";
import { createServiceClient } from "@/lib/supabase/serviceClient";
import { sendBrevoEmail } from "./brevo";

export async function flushInvestorNotificationEmails(limit = 25) {
  const supabase = createServiceClient();

  const { data: pending, error } = await supabase
    .from("investor_notifications")
    .select("id, title, body, investors(name, email)")
    .eq("email_status", "pending")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error || !pending || pending.length === 0) return;

  for (const notif of pending as any[]) {
    const email = notif.investors?.email;
    if (!email) {
      await supabase.from("investor_notifications").update({ email_status: "failed" }).eq("id", notif.id);
      continue;
    }

    const result = await sendBrevoEmail({
      to: email,
      toName: notif.investors?.name,
      subject: notif.title,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1B2433;">${notif.title}</h2>
          <p style="color: #4b5563; line-height: 1.6;">${notif.body ?? ""}</p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
            Engineer Bhai'r Dokan — Investor Portal
          </p>
        </div>
      `,
    });

    await supabase
      .from("investor_notifications")
      .update({ email_status: result.success ? "sent" : "failed" })
      .eq("id", notif.id);
  }
}
