"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateContactInfo(input: {
  businessName: string; logoUrl: string; phone: string; whatsapp: string; email: string;
  website: string; facebook: string; instagram: string; youtube: string; address: string; googleMapEmbed: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_information")
    .update({
      business_name: input.businessName,
      logo_url: input.logoUrl || null,
      phone: input.phone || null,
      whatsapp: input.whatsapp || null,
      email: input.email || null,
      website: input.website || null,
      facebook: input.facebook || null,
      instagram: input.instagram || null,
      youtube: input.youtube || null,
      address: input.address || null,
      google_map_embed: input.googleMapEmbed || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateDeliverySettings(input: { insideDhaka: number; outsideDhaka: number }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("delivery_settings")
    .update({ inside_dhaka_charge: input.insideDhaka, outside_dhaka_charge: input.outsideDhaka, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}
