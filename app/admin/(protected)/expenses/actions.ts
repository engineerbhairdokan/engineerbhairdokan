"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createExpense(input: { category: string; amount: number; description: string; expenseDate: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").insert({
    category: input.category,
    amount: input.amount,
    description: input.description || null,
    expense_date: input.expenseDate,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/expenses");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/expenses");
  revalidatePath("/admin");
}
