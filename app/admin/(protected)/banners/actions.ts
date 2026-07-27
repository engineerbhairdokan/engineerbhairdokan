"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createBanner(input: { imageUrl: string; title: string; linkUrl: string; sortOrder: number }) {
  const supabase = await createClient();
  const { error } = await supabase.from("banners").insert({
    image_url: input.imageUrl,
    title: input.title || null,
    link_url: input.linkUrl || null,
    sort_order: input.sortOrder,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { success: true };
}

export async function toggleBannerActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("banners").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function deleteBanner(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/banners");
  revalidatePath("/");
}
