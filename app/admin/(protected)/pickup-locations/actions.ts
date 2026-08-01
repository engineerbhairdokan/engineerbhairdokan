"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPickupLocation(input: { name: string; address: string; phone: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from("pickup_locations").insert({
    name: input.name,
    address: input.address,
    phone: input.phone || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/pickup-locations");
  return { success: true };
}

export async function updatePickupLocation(id: string, input: { name: string; address: string; phone: string }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("pickup_locations")
    .update({ name: input.name, address: input.address, phone: input.phone || null })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/pickup-locations");
  return { success: true };
}

export async function togglePickupLocationActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("pickup_locations").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/pickup-locations");
}

export async function deletePickupLocation(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("pickup_locations").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/pickup-locations");
}
