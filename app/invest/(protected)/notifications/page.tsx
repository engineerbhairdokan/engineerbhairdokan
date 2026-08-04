import { createClient } from "@/lib/supabase/server";
import { Bell } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InvestorNotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: investorRow } = await supabase.from("investors").select("id").eq("auth_user_id", user!.id).single();
  const investorId = (investorRow as any)?.id;

  const { data } = await supabase
    .from("investor_notifications")
    .select("id, title, body, notif_type, is_read, created_at")
    .eq("investor_id", investorId)
    .order("created_at", { ascending: false })
    .limit(100);
  const notifications = (data ?? []) as any[];

  return (
    <section>
      <h2 className="font-display font-bold text-ink mb-3 flex items-center gap-2">
        <Bell className="h-4 w-4 text-gold-600" /> Notifications
      </h2>
      <div className="space-y-2">
        {notifications.length === 0 && <p className="text-sm text-ink/40">No notifications yet.</p>}
        {notifications.map((n) => (
          <div key={n.id} className={`rounded-xl border p-3 text-sm ${n.is_read ? "border-ink/10 bg-white" : "border-gold bg-gold-100"}`}>
            <p className="font-medium text-ink">{n.title}</p>
            {n.body && <p className="text-ink/60 text-xs mt-0.5">{n.body}</p>}
            <p className="text-ink/30 text-[10px] mt-1">{new Date(n.created_at).toLocaleString("en-GB")}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
