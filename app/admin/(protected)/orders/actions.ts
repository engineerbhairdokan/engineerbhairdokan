"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const ORDER_STATUSES = [
  "pending", "confirmed", "processing", "packed", "handed_to_courier",
  "in_transit", "delivered", "returned", "cancelled",
] as const;

export async function updateOrderStatus(orderId: string, status: (typeof ORDER_STATUSES)[number]) {
  const supabase = await createClient();

  const patch: Record<string, unknown> = { status };
  if (status === "confirmed") patch.confirmed_at = new Date().toISOString();
  if (status === "delivered") patch.delivered_at = new Date().toISOString();

  const { error } = await supabase.from("orders").update(patch).eq("id", orderId);
  if (error) return { error: error.message };

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { success: true };
}

export async function assignCourier(orderId: string, courierId: string | null, trackingNumber: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ courier_id: courierId, tracking_number: trackingNumber || null })
    .eq("id", orderId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function updateReturnCharge(orderId: string, returnCharge: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ return_charge: returnCharge }).eq("id", orderId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  return { success: true };
}

export async function generateInvoice(orderId: string) {
  const supabase = await createClient();

  const { data: existing } = await supabase.from("invoices").select("id").eq("order_id", orderId).maybeSingle();
  if (existing) return { success: true, alreadyExisted: true };

  const { error } = await supabase.from("invoices").insert({ order_id: orderId });
  if (error) return { error: error.message };

  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}
