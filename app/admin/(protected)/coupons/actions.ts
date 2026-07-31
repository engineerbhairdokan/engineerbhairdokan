"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCoupon(input: {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxUses: number | null;
  minOrderAmount: number;
  validFrom: string;
  validUntil: string | null;
  note: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").insert({
    code: input.code.toUpperCase().trim(),
    discount_type: input.discountType,
    discount_value: input.discountValue,
    max_uses: input.maxUses,
    min_order_amount: input.minOrderAmount,
    valid_from: input.validFrom,
    valid_until: input.validUntil || null,
    note: input.note || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function toggleCouponActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("coupons").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/coupons");
}
