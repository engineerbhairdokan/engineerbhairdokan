import { createClient } from "@/lib/supabase/server";

export type CurrentAdmin = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "staff";
  is_active: boolean;
};

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("admin_users")
    .select("id, name, email, role, is_active")
    .eq("auth_user_id", user.id)
    .single();

  return (data as CurrentAdmin) ?? null;
}
