"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCourier(input: {
  name: string; merchantCode: string; insideDhaka: number; outsideDhaka: number; returnCharge: number; phone: string; website: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("couriers").insert({
    name: input.name,
    merchant_code: input.merchantCode || null,
    charge_inside_dhaka: input.insideDhaka,
    charge_outside_dhaka: input.outsideDhaka,
    return_charge: input.returnCharge,
    phone: input.phone || null,
    website: input.website || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/couriers");
  return { success: true };
}

export async function toggleCourierActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("couriers").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/couriers");
}

export async function deleteCourier(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("couriers").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/couriers");
}
