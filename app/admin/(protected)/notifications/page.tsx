"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, CheckCheck } from "lucide-react";

type Notification = { id: string; title: string; body: string | null; notif_type: string; is_read: boolean; created_at: string; related_order_id: string | null };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPending, startTransition] = useTransition();

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
    setNotifications((data as Notification[]) ?? []);
  }

  useEffect(() => {
    load();
    const supabase = createClient();
    const channel = supabase
      .channel("admin-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function markRead(id: string) {
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    load();
  }

  async function markAllRead() {
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    load();
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="spec-readout text-xs text-gold-600">Alerts</p>
          <h1 className="font-display font-bold text-2xl text-ink flex items-center gap-2">
            Notifications
            {unreadCount > 0 && <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-ink">{unreadCount}</span>}
          </h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => startTransition(markAllRead)}
            disabled={isPending}
            className="flex items-center gap-1.5 text-sm text-gold-600 hover:underline"
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-3 rounded-2xl border p-4 ${n.is_read ? "border-ink/10 bg-white" : "border-gold bg-gold-100"}`}
          >
            <Bell className={`h-4 w-4 mt-0.5 shrink-0 ${n.is_read ? "text-ink/30" : "text-gold-600"}`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">{n.title}</p>
              {n.body && <p className="text-sm text-ink/60 mt-0.5">{n.body}</p>}
              <p className="text-xs text-ink/40 mt-1">{new Date(n.created_at).toLocaleString("en-GB")}</p>
            </div>
            {!n.is_read && (
              <button onClick={() => markRead(n.id)} className="text-xs text-gold-600 hover:underline shrink-0">Mark read</button>
            )}
          </div>
        ))}
        {notifications.length === 0 && <p className="text-sm text-ink/40 text-center py-10">No notifications yet.</p>}
      </div>
    </div>
  );
}
