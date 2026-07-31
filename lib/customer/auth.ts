import { createClient } from "@/lib/supabase/server";

export type CurrentCustomer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  loyalty_points: number;
  membership_status: "none" | "pending" | "active" | "expired";
  membership_discount_percent: number;
  membership_valid_until: string | null;
  membership_card_number: string | null;
};

export async function getCurrentCustomer(): Promise<CurrentCustomer | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("customers")
    .select("id, name, phone, email, loyalty_points, membership_status, membership_discount_percent, membership_valid_until, membership_card_number")
    .eq("auth_user_id", user.id)
    .single();

  return (data as unknown as CurrentCustomer) ?? null;
}
