"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createInvestment(input: { investmentType: string; amount: number; description: string; investedAt: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from("investments").insert({
    investment_type: input.investmentType,
    amount: input.amount,
    description: input.description || null,
    invested_at: input.investedAt,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/investments");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteInvestment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("investments").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/investments");
  revalidatePath("/admin");
}
