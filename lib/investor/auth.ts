import { createClient } from "@/lib/supabase/server";

export type CurrentInvestor = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  status: "pending_approval" | "active" | "suspended";
  balance: number;
};

export async function getCurrentInvestor(): Promise<CurrentInvestor | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("investors")
    .select("id, name, phone, email, status")
    .eq("auth_user_id", user.id)
    .single();

  if (!data) return null;

  const { data: balanceRow } = await supabase
    .from("investor_balances")
    .select("balance")
    .eq("investor_id", (data as any).id)
    .single();

  return { ...(data as any), balance: (balanceRow as any)?.balance ?? 0 };
}
