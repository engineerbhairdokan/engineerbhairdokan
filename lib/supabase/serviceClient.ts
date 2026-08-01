import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * IMPORTANT: this client bypasses Row Level Security entirely.
 * Only ever import this in server-only code (server actions, route handlers).
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createSupabaseClient<any>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
